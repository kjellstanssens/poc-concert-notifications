from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, services
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Performer)
def create_performer(performer_in: schemas.PerformerCreate, db: Session = Depends(get_db)):
    """Get or create a performer."""
    return services.get_or_create_performer(db, performer_in)

@router.get("/", response_model=List[schemas.Performer])
def read_performers(db: Session = Depends(get_db)):
    """List all performers."""
    return services.get_all_performers(db)

@router.get("/{performer_id}", response_model=schemas.Performer)
def read_performer(performer_id: int, db: Session = Depends(get_db)):
    """Get a specific performer by ID."""
    db_performer = services.get_performer_by_id(db, performer_id=performer_id)
    if not db_performer:
        raise HTTPException(status_code=404, detail="Performer not found")
    return db_performer
