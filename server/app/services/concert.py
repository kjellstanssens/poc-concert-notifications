import sqlalchemy as sa
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_
from datetime import datetime
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.concert import Concert
from app.models.performer import Performer
from app.models.venue import Venue  # Added Venue model import
from app import schemas

@celery_app.task(name="app.services.concert.process_scraped_items")
def process_scraped_items(venue_id: int, items: list):
    """
    Celery task to process a list of scraped items for a specific venue.
    This replaces the sequential loop in run_scraper.py.
    """
    db = SessionLocal()
    try:
        new_count = 0
        updated_count = 0
        now = datetime.now()

        for item in items:
            # Check if exists
            db_concert = get_concert_by_url(db, item["url"])
            
            if db_concert:
                # Potential update
                if db_concert.content_hash != item["content_hash"]:
                    # In a real app, you'd resolve performer_ids from names here
                    # For simplicity, we just update the core metadata
                    db_concert.title = item["title"]
                    db_concert.date = item["date"]
                    db_concert.content_hash = item["content_hash"]
                    db_concert.status = "active"
                    db_concert.last_scraped_at = now
                    updated_count += 1
                else:
                    # Just update heartbeat
                    db_concert.last_scraped_at = now
            else:
                # Create new
                # In a real app, resolve venue/performers
                # This is a simplified version for the POC demo
                new_concert = Concert(
                    title=item["title"],
                    url=item["url"],
                    date=item["date"],
                    venue_id=venue_id,
                    content_hash=item["content_hash"],
                    status="active",
                    last_scraped_at=now
                )
                db.add(new_concert)
                new_count += 1
        
        db.commit()
        # Mark missing ones as cancelled
        mark_venue_concerts_removed(db, venue_id, now)
        
        return {
            "venue_id": venue_id,
            "new": new_count,
            "updated": updated_count,
            "processed_at": now.isoformat()
        }
    finally:
        db.close()

def get_concert_by_id(db: Session, concert_id: int):
    """Retrieve a concert by ID, including venue and performers using joinedload."""
    return db.execute(
        select(Concert)
        .options(joinedload(Concert.venue), joinedload(Concert.performers))
        .where(Concert.id == concert_id)
    ).unique().scalar_one_or_none()

def get_active_concerts(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieve concerts where date >= now() AND is_active == True.
    Includes venue and performers using joinedload.
    """
    return db.execute(
        select(Concert)
        .options(joinedload(Concert.venue), joinedload(Concert.performers))
        .where(
            and_(
                Concert.date >= datetime.now(),
                Concert.is_active == True
            )
        )
        .offset(skip)
        .limit(limit)
    ).scalars().unique().all()

def soft_delete_concert(db: Session, concert_id: int) -> bool:
    """Soft delete a concert by setting is_active to False."""
    db_obj = db.get(Concert, concert_id)
    if not db_obj:
        return False
    
    db_obj.is_active = False
    db.add(db_obj)
    db.commit()
    return True

def get_concert_by_url(db: Session, url: str):
    """Retrieve a concert by its canonical URL (external_id)."""
    return db.execute(
        select(Concert).where(Concert.url == url)
    ).scalar_one_or_none()

def update_concert(db: Session, concert: Concert, concert_update: schemas.ConcertCreate):
    """Update an existing concert's fields and performers."""
    concert.title = concert_update.title
    concert.date = concert_update.date
    concert.content_hash = concert_update.content_hash
    concert.status = "active"
    
    # Update performers
    if concert_update.performer_ids:
        performers = db.execute(
            select(Performer).where(Performer.id.in_(concert_update.performer_ids))
        ).scalars().all()
        concert.performers = performers
    
    db.add(concert)
    db.commit()
    db.refresh(concert)
    return concert

def mark_venue_concerts_removed(db: Session, venue_id: int, last_scraped_at: datetime):
    """Mark concerts for a venue as 'cancelled' if they weren't seen in the latest scrape."""
    db.execute(
        sa.update(Concert)
        .where(
            sa.and_(
                Concert.venue_id == venue_id,
                Concert.last_scraped_at < last_scraped_at,
                Concert.status == "active"
            )
        )
        .values(status="cancelled")
    )
    db.commit()

def get_all_concerts(db: Session, skip: int = 0, limit: int = 100):
    """List concerts with joinedload for all associated relationships."""
    return db.execute(
        select(Concert)
        .options(joinedload(Concert.venue), joinedload(Concert.performers))
        .offset(skip)
        .limit(limit)
    ).scalars().unique().all()

def create_concert(db: Session, concert_in: schemas.ConcertCreate):
    """
    Convert Pydantic data to a dictionary (model_dump).
    Validate venue existence.
    Retrieve Performer objects from the database based on performer_ids.
    Link performers to the Concert model relationship.
    Save and return the enriched object.
    """
    # Defensive check for venue existence
    venue = db.get(Venue, concert_in.venue_id)
    if not venue:
        raise ValueError(f"Venue with id {concert_in.venue_id} does not exist")

    # model_dump(mode="json") handles datetime/url conversion for SQLAlchemy
    obj_in_data = concert_in.model_dump(exclude={"performer_ids"}, mode="json")
    db_obj = Concert(**obj_in_data)
    
    if concert_in.performer_ids:
        performers = db.execute(
            select(Performer).where(Performer.id.in_(concert_in.performer_ids))
        ).scalars().all()
        db_obj.performers = list(performers)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Reload with relations for the return object
    return get_concert_by_id(db, db_obj.id)
