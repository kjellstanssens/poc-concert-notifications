import logging
import urllib.robotparser
import hashlib
import json
import re
import html
from typing import List, Dict, Any
from datetime import datetime
from urllib.parse import urljoin, urlparse
from scrapling import Fetcher
from .config_models import VenueScraperConfig, PerformerStrategy

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self):
        self.fetcher = Fetcher()
        self._robot_parsers = {}

    def _is_allowed(self, url: str) -> bool:
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        if base_url not in self._robot_parsers:
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(f"{base_url}/robots.txt")
            try:
                rp.read()
                self._robot_parsers[base_url] = rp
            except Exception as e:
                logger.warning(f"Could not read robots.txt for {base_url}: {e}")
                return True # Default to allowed if robots.txt is missing/error
        
        return self._robot_parsers[base_url].can_fetch("*", url)

    def scrape_venue(self, config: VenueScraperConfig) -> List[Dict[str, Any]]:
        url = str(config.start_url)
        if not self._is_allowed(url):
            logger.warning(f"Scraping {url} is DISALLOWED by robots.txt")
            return []

        logger.info(f"Fetching {url} for {config.venue_name}")
        
        try:
            response = self.fetcher.get(url)
            cards = response.css(config.selectors.card)
        except Exception as e:
            logger.error(f"Failed to fetch or initial parse for {config.venue_name}: {e}")
            return []
        
        scraped_data = []
        for card in cards:
            try:
                title_sel = card.css(config.selectors.title)
                if not title_sel:
                    continue
                # Use get_all_text() to get combined text from nested elements
                # Clean up newlines and extra spaces (common in AB and others)
                title = " ".join(title_sel[0].get_all_text().split()).strip()

                date_sel = card.css(config.selectors.date)
                if not date_sel:
                    continue
                
                # Check for specific attribute if configured, else fallback to text
                if config.date_parsing.attr:
                    date_str = date_sel[0].attrib.get(config.date_parsing.attr, "").strip()
                else:
                    date_str = date_sel[0].get_all_text().strip()
                
                # Date Parsing
                dt = self._parse_date(date_str, config)
                
                # URL handling
                full_url = str(config.start_url)
                if config.selectors.url == "self":
                    raw_url = card.attrib.get('href')
                    if raw_url:
                        full_url = urljoin(str(config.start_url), raw_url.strip())
                elif config.selectors.url:
                    url_sel = card.css(config.selectors.url)
                    if url_sel:
                        raw_url = url_sel[0].attrib.get('href')
                        if raw_url:
                            full_url = urljoin(str(config.start_url), raw_url.strip())
                
                # Image Handling (Safety: Always attempt if possible)
                image_url = None
                should_try_detail_img = (config.selectors.image == "DETAIL_IMG") or not config.selectors.image
                
                if should_try_detail_img and full_url:
                    try:
                        detail_resp = self.fetcher.get(full_url)
                        og_img = detail_resp.css('meta[property="og:image"]')
                        if og_img:
                            image_url = og_img[0].attrib.get('content')
                        
                        if not image_url:
                            img_detail = (
                                detail_resp.css(".event-detail__header__info img") or 
                                detail_resp.css(".event-detail__header img") or
                                detail_resp.css(".program-detail__image img")
                            )
                            if img_detail:
                                raw_img = img_detail[0].attrib.get('src') or img_detail[0].attrib.get('data-src')
                                if raw_img:
                                    image_url = urljoin(full_url, raw_img.strip())
                    except Exception as e:
                        logger.error(f"Failed to fetch detail image from {full_url}: {e}")

                if not image_url and config.selectors.image and config.selectors.image != "DETAIL_IMG":
                    img_sel = card.css(config.selectors.image)
                    if img_sel:
                        raw_img = img_sel[0].attrib.get('src') or img_sel[0].attrib.get('data-src') or img_sel[0].attrib.get('srcset')
                        if raw_img:
                            if ',' in raw_img:
                                raw_img = raw_img.split(',')[0].strip().split(' ')[0]
                            image_url = urljoin(str(config.start_url), raw_img.strip())

                # Price Handling (Safety: Always attempt if empty)
                price = None
                should_try_detail_price = (config.selectors.price in ["DETAIL_PRICE", "LD_JSON"]) or not config.selectors.price
                
                if should_try_detail_price and full_url:
                    try:
                        detail_resp = self.fetcher.get(full_url)
                        
                        # Strategy: LD+JSON
                        scripts = detail_resp.css('script[type="application/ld+json"]')
                        for script in scripts:
                            try:
                                data = json.loads(script.get_all_text())
                                objects = data if isinstance(data, list) else [data]
                                for obj in objects:
                                    if obj.get("@type") == "Event":
                                        offers = obj.get("offers")
                                        if isinstance(offers, list) and len(offers) > 0:
                                            offers = offers[0]
                                        if isinstance(offers, dict):
                                            p_val = offers.get("price")
                                            if p_val is not None:
                                                price = float(str(p_val).replace(',', '.'))
                                                break
                                if price: break
                            except: continue

                        # Strategy: Regex on Detail Page Source
                        if not price:
                            # Use content of response
                            content = detail_resp.text
                            # Unescape and normalize spacing strictly
                            source = html.unescape(content)
                            source = source.replace('\u00a0', ' ').replace('&nbsp;', ' ')
                            
                            # Log first 500 chars of source for debugging in case of failure
                            # logger.debug(f"Source sample: {source[:500]}")

                            # AB Specific Logic: <dd>€ 26.4</dd>
                            ab_match = re.search(r'€\s*([\d.]+)', source)
                            if ab_match:
                                try:
                                    price = float(ab_match.group(1))
                                except: pass
                            
                            # Trix Specific Logic: € 17,50
                            if not price:
                                trix_match = re.search(r'€\s*(\d+(?:,\d+)?)', source)
                                if trix_match:
                                    try:
                                        price = float(trix_match.group(1).replace(',', '.'))
                                    except: pass
                    except Exception as e:
                        logger.error(f"Failed detail price extraction from {full_url}: {e}")

                # Fallback to selector if still no price
                if not price and config.selectors.price and config.selectors.price not in ["DETAIL_PRICE", "LD_JSON"]:
                    price_sel = card.css(config.selectors.price)
                    if price_sel:
                        price_text = price_sel[0].get_all_text().strip()
                        price_match = re.search(r'(\d+(?:[.,]\d+)?)', price_text)
                        if price_match:
                            price = float(price_match.group(1).replace(',', '.'))

                # Performers
                performers = self._split_performers(title, config.performer_strategy)
                
                # Content Hash (Fingerprint)
                # We hash title, date, performers to detect changes
                content_str = f"{title}|{dt.isoformat()}|{sorted(performers)}|{price}|{image_url}"
                content_hash = hashlib.md5(content_str.encode()).hexdigest()

                scraped_data.append({
                    "title": title,
                    "date": dt,
                    "url": full_url,
                    "image_url": image_url,
                    "price": price,
                    "performers": performers,
                    "venue_name": config.venue_name,
                    "content_hash": content_hash
                })
            except Exception as e:
                logger.error(f"Error parsing card in {config.venue_name}: {e}")
                
        return scraped_data

    def _parse_date(self, date_str: str, config: VenueScraperConfig) -> datetime:
        if config.date_parsing.type == "iso":
            # Handle 'Z' or other ISO variations
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        
        # Simple format parsing
        # Try to parse only the beginning if there's trailing junk (common in scrapers)
        try:
            return datetime.strptime(date_str, config.date_parsing.format)
        except ValueError as e:
            # If "unconverted data remains", try to truncate the string to the expected length
            if "unconverted data remains" in str(e):
                logger.warning(f"Trailing data in date string '{date_str}' for format '{config.date_parsing.format}'. Trying fallback parsing.")
                # Fallback: try to see if we can parse just the prefix that matches the format length
                # This is a bit hacky but works for many fixed-width formats
                # A better way is to iterate or use regex, but let's try a common trick:
                # strptime doesn't have a 'partial' flag, but we can try to find the match within the string.
                # Here we'll just try to parse the string by repeatedly shortening it from the right.
                temp_str = date_str
                while len(temp_str) > 2:
                    try:
                        temp_str = temp_str[:-1].strip()
                        return datetime.strptime(temp_str, config.date_parsing.format)
                    except ValueError:
                        continue
                raise e
            raise e

    def _split_performers(self, title: str, strategy: PerformerStrategy) -> List[str]:
        performers = [title]
        for sep in strategy.split_by:
            new_list = []
            for p in performers:
                new_list.extend([item.strip() for item in p.split(sep) if item.strip()])
            performers = new_list
        return performers
