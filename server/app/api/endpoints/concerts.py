from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app import schemas, services
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Concert)
def create_concert(concert_in: schemas.ConcertCreate, db: Session = Depends(get_db)):
    """Create a new concert."""
    # Check if concert already exists via hash
    if concert_in.content_hash:
        db_concert = services.get_concert_by_hash(db, concert_in.content_hash)
        if db_concert:
            raise HTTPException(status_code=400, detail="Concert with this content hash already exists")
    
    try:
        return services.create_concert(db, concert_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.Concert])
def read_concerts(
    skip: int = 0, 
    limit: int = 100, 
    active_only: bool = True,
    q: str = Query(None, alias="q"),
    db: Session = Depends(get_db)
):
    """List concerts with optional filtering."""
    if active_only:
        return services.get_active_concerts(db, skip=skip, limit=limit, search=q)
    return services.get_all_concerts(db, skip=skip, limit=limit)

@router.get("/{concert_id}", response_model=schemas.Concert)
def read_concert(concert_id: int, db: Session = Depends(get_db)):
    """Get a specific concert by ID."""
    db_concert = services.get_concert_by_id(db, concert_id=concert_id)
    if not db_concert:
        raise HTTPException(status_code=404, detail="Concert not found")
    return db_concert

@router.patch("/{concert_id}/soft-delete", response_model=dict)
def soft_delete_concert(concert_id: int, db: Session = Depends(get_db)):
    """Deactivate a concert (soft delete)."""
    success = services.soft_delete_concert(db, concert_id=concert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Concert not found")
    return {"message": "Concert deactivated successfully"}
