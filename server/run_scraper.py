import yaml
import logging
import sys
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

# Add current directory to path so app.* works
sys.path.append(str(Path(__file__).parent))

from app.core.database import SessionLocal
from app.models.venue import Venue  # Changed from app.services
from app.services import performer as performer_service
from app.services import concert as concert_service
from app.core.celery_app import celery_app
from app.services.concert import process_scraped_items

# Enable eager execution for testing/debugging
celery_app.conf.task_always_eager = True
celery_app.conf.task_eager_propagates = True

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
    
    # Get all active venues from DB
    active_venues = db.query(Venue).filter(Venue.is_active == True).all()
    
    if not active_venues:
        logger.warning("No active venues found in database.")
        return

    for venue in active_venues:
        try:
            if not venue.scraper_config:
                logger.warning(f"Venue {venue.name} has no scraper_config. Skipping.")
                continue

            # Reconstruct the config object from DB JSON
            # We map DB fields to the expected VenueScraperConfig structure
            config_data = {
                "venue_name": venue.name,
                "start_url": venue.website_url,
                **venue.scraper_config
            }
            
            config = VenueScraperConfig(**config_data)
                
            results = engine.scrape_venue(config)
            logger.info(f"Scraped {len(results)} potential events from {venue.name}")
            
            # Dispatch to Celery Worker for parallel processing
            if results:
                # Convert dates to ISO strings for JSON serialization
                serializable_results = []
                for res in results:
                    item = res.copy()
                    if isinstance(item.get('date'), datetime):
                        item['date'] = item['date'].isoformat()
                    serializable_results.append(item)
                
                logger.info(f"Dispatching task for {venue.name}...")
                process_scraped_items.delay(venue.id, serializable_results)
            else:
                logger.info(f"No results for {venue.name}")

        except Exception as e:
            logger.error(f"Error processing venue {venue.name}: {e}")

    db.close()

if __name__ == "__main__":
    run()
