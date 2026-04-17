from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.venue import Venue
from app import schemas

def get_venue_by_id(db: Session, venue_id: int):
    """Find a venue by its Primary Key."""
    return db.get(Venue, venue_id)

def get_venue_by_name(db: Session, name: str):
    """Search for a venue by name using a case-insensitive match (ilike)."""
    return db.execute(
        select(Venue).where(Venue.name.ilike(name))
    ).scalar_one_or_none()

def get_all_venues(db: Session):
    """Retrieve all venues, useful for frontend dropdowns or lists."""
    return db.execute(select(Venue)).scalars().all()

def create_venue(db: Session, venue_in: schemas.VenueCreate):
    """Create and commit a new Venue using model_dump()."""
    # model_dump(mode="json") ensures types like HttpUrl are converted to strings
    db_obj = Venue(**venue_in.model_dump(mode="json"))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
