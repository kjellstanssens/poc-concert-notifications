from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_
from datetime import datetime
from app.models.concert import Concert
from app.models.performer import Performer
from app.models.venue import Venue  # Added Venue model import
from app import schemas

def get_concert_by_id(db: Session, concert_id: int):
    """Retrieve a concert by ID, including venue and performers using joinedload."""
    return db.execute(
        select(Concert)
        .options(joinedload(Concert.venue), joinedload(Concert.performers))
        .where(Concert.id == concert_id)
    ).scalar_one_or_none()

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

def get_concert_by_hash(db: Session, content_hash: str):
    """Perform an idempotency check for the scraper to prevent duplicate concerts."""
    return db.execute(
        select(Concert).where(Concert.content_hash == content_hash)
    ).scalar_one_or_none()

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

    # model_dump exclude performer_ids as they are handled manually for relationship
    obj_in_data = concert_in.model_dump(exclude={"performer_ids"})
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
