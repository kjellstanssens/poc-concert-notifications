from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import schemas, services
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Venue)
def create_venue(venue_in: schemas.VenueCreate, db: Session = Depends(get_db)):
    """Create a new venue."""
    db_venue = services.get_venue_by_name(db, name=venue_in.name)
    if db_venue:
        raise HTTPException(status_code=400, detail="Venue with this name already exists")
    return services.create_venue(db, venue_in)

@router.get("/", response_model=List[schemas.Venue])
def read_venues(db: Session = Depends(get_db)):
    """List all venues."""
    return services.get_all_venues(db)

@router.get("/{venue_id}", response_model=schemas.Venue)
def read_venue(venue_id: int, db: Session = Depends(get_db)):
    """Get a specific venue by ID."""
    db_venue = services.get_venue_by_id(db, venue_id=venue_id)
    if not db_venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return db_venue
