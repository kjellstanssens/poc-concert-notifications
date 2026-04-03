from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.performer import Performer
from app import schemas

def get_performer_by_name(db: Session, name: str):
    """Case-insensitive lookup via .ilike()."""
    return db.execute(
        select(Performer).where(Performer.name.ilike(name))
    ).scalar_one_or_none()

def get_performer_by_id(db: Session, performer_id: int):
    """Standard lookup by Primary Key."""
    return db.get(Performer, performer_id)

def get_all_performers(db: Session):
    """Retrieve all performers as a list."""
    return db.execute(select(Performer)).scalars().all()

def get_or_create_performer(db: Session, performer_in: schemas.PerformerCreate):
    """
    Check if a performer exists by name.
    If not, create and commit a new Performer.
    Returns the Performer object.
    """
    db_obj = get_performer_by_name(db, performer_in.name)
    if not db_obj:
        db_obj = Performer(name=performer_in.name)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
    return db_obj
