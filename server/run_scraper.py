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
    run_time = datetime.utcnow()
    
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
            
            new_count = 0
            update_count = 0
            for res in results:
                # 1. Resolve Performers
                performer_ids = []
                for p_name in res['performers']:
                    perf = performer_service.get_or_create_performer(
                        db, schemas.PerformerCreate(name=p_name.strip())
                    )
                    performer_ids.append(perf.id)
                
                # 2. Check for existing concert by URL (Stable Identity)
                existing = concert_service.get_concert_by_url(db, res['url'])
                
                concert_in = schemas.ConcertCreate(
                    title=res['title'],
                    date=res['date'],
                    content_hash=res['content_hash'],
                    venue_id=venue.id,
                    performer_ids=performer_ids,
                    url=res['url'],
                    status="active",
                    last_scraped_at=run_time
                )

                if existing:
                    # Check if content changed
                    if existing.content_hash != res['content_hash']:
                        logger.info(f"Change detected for {res['title']}. Updating.")
                        concert_service.update_concert(db, existing, concert_in)
                        update_count += 1
                    else:
                        # Just update the heartbeat
                        existing.last_scraped_at = run_time
                        db.commit()
                    continue

                # 3. Create Concert
                try:
                    concert_service.create_concert(db, concert_in)
                    new_count += 1
                except Exception as e:
                    logger.error(f"Failed to save concert {res['title']}: {e}")

            logger.info(f"Venue {config.venue_name}: {new_count} new, {update_count} updated.")
            
            # 4. Detect removals (Cancellations)
            concert_service.mark_venue_concerts_removed(db, venue.id, run_time)

        except Exception as e:
            logger.error(f"Error processing venue {v_conf.get('venue_name', 'Unknown')}: {e}")

    db.close()

if __name__ == "__main__":
    run()
