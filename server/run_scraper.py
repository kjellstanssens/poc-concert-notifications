import yaml
import logging
import sys
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

# Add current directory to path so app.* works
sys.path.append(str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.services import venue as venue_service
from app.services import performer as performer_service
from app.services import concert as concert_service
from app.services.concert import process_scraped_items
from app import schemas
from scraper.engine import ScraperEngine
from scraper.config_models import VenueScraperConfig

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("scraper_runner")

def run():
    db = SessionLocal()
    engine = ScraperEngine()
    
    config_path = Path(__file__).parent / "configs" / "scraper_config.yaml"
    if not config_path.exists():
        logger.error(f"Config file not found: {config_path}")
        return

    with open(config_path, "r") as f:
        config_data = yaml.safe_load(f)
        
    for v_conf in config_data['venues']:
        try:
            config = VenueScraperConfig(**v_conf)
            venue = venue_service.get_venue_by_name(db, config.venue_name)
            
            if not venue:
                logger.warning(f"Venue {config.venue_name} not found in DB. Skipping.")
                continue
                
            results = engine.scrape_venue(config)
            logger.info(f"Scraped {len(results)} potential events from {config.venue_name}")
            
            # Dispatch to Celery Worker for parallel processing
            if results:
                # Convert dates to ISO strings for JSON serialization
                serializable_results = []
                for res in results:
                    item = res.copy()
                    if isinstance(item['date'], datetime):
                        item['date'] = item['date'].isoformat()
                    serializable_results.append(item)
                
                logger.info(f"Dispatching task for {config.venue_name}...")
                process_scraped_items.delay(venue.id, serializable_results)
            else:
                logger.info(f"No results for {config.venue_name}")

        except Exception as e:
            logger.error(f"Error processing venue {v_conf.get('venue_name', 'Unknown')}: {e}")

    db.close()

if __name__ == "__main__":
    run()
