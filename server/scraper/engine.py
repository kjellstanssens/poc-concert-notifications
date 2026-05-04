import logging
import hashlib
import json
import re
import html
from typing import List, Dict, Any
from datetime import datetime
from urllib.parse import urljoin, urlparse
from scrapling import Fetcher
from .config_models import VenueScraperConfig, PerformerStrategy, ScrapedItem

logger = logging.getLogger(__name__)

class ScraperEngine:
    def __init__(self):
        # Enable robots.txt compliance in Scrapling
        self.fetcher = Fetcher(auto_match=True, robots_txt_obey=True)

    def scrape_venue(self, config: VenueScraperConfig) -> List[Dict[str, Any]]:
        url = str(config.start_url)
        logger.info(f"Fetching {url} for {config.venue_name}")
        
        try:
            response = self.fetcher.get(url)
            if not response.text:
                logger.warning(f"No content returned for {url}. Possibly blocked by robots.txt or network issue.")
                return []
                
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
                
                # Date Parsing - Handled by the model
                dt = config.date_parsing.parse(date_str)
                
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
                                                price = p_val
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

                            # AB & Trix Specific Logic: Matches symbols like € followed by price
                            price_match = re.search(r'€\s*([\d.,]+)', source)
                            if price_match:
                                price = price_match.group(1)
                    except Exception as e:
                        logger.error(f"Failed detail price extraction from {full_url}: {e}")

                # Fallback to selector if still no price
                if not price and config.selectors.price and config.selectors.price not in ["DETAIL_PRICE", "LD_JSON"]:
                    price_sel = card.css(config.selectors.price)
                    if price_sel:
                        price = price_sel[0].get_all_text().strip()

                # Performers
                performers = self._split_performers(title, config.performer_strategy)
                
                # Content Hash (Fingerprint)
                content_str = f"{title}|{dt.isoformat()}|{sorted(performers)}|{price}|{image_url}"
                content_hash = hashlib.md5(content_str.encode()).hexdigest()

                # Use ScrapedItem for final validation and cleaning
                item = ScrapedItem(
                    title=title,
                    date=dt,
                    url=full_url,
                    image_url=image_url,
                    price=price,
                    performers=performers,
                    venue_name=config.venue_name,
                    content_hash=content_hash
                )
                scraped_data.append(item.model_dump())
            except Exception as e:
                logger.error(f"Error parsing card in {config.venue_name}: {e}")
                
        return scraped_data

    def _split_performers(self, title: str, strategy: PerformerStrategy) -> List[str]:
        performers = [title]
        for sep in strategy.split_by:
            new_list = []
            for p in performers:
                new_list.extend([item.strip() for item in p.split(sep) if item.strip()])
            performers = new_list
        return performers
