import logging
import urllib.robotparser
import hashlib
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
                # Use get_all_text() to get combined text from nested elements (like <em>)
                title = title_sel[0].get_all_text().strip()

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
                
                # Performers
                performers = self._split_performers(title, config.performer_strategy)
                
                # Content Hash (Fingerprint)
                # We hash title, date, performers to detect changes
                content_str = f"{title}|{dt.isoformat()}|{sorted(performers)}"
                content_hash = hashlib.md5(content_str.encode()).hexdigest()

                scraped_data.append({
                    "title": title,
                    "date": dt,
                    "url": full_url,
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
        return datetime.strptime(date_str, config.date_parsing.format)

    def _split_performers(self, title: str, strategy: PerformerStrategy) -> List[str]:
        performers = [title]
        for sep in strategy.split_by:
            new_list = []
            for p in performers:
                new_list.extend([item.strip() for item in p.split(sep) if item.strip()])
            performers = new_list
        return performers
