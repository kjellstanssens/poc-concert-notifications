from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.core.database import SessionLocal
from app.models.subscription import Subscription
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_subscriptions(user_id: int, db: Session = Depends(get_db)):
    """List all subscriptions for a given user."""
    subs = db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    ).scalars().all()
    return subs

@router.post("/")
def create_subscription(
    user_id: int, 
    venue_id: Optional[int] = None, 
    performer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Subscribe a user to a venue or performer."""
    if not venue_id and not performer_id:
        raise HTTPException(status_code=400, detail="Must provide either venue_id or performer_id")
    
    # Check for existing
    existing = db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.venue_id == venue_id,
            Subscription.performer_id == performer_id
        )
    ).first()
    
    if existing:
        return {"message": "Already subscribed"}
        
    sub = Subscription(user_id=user_id, venue_id=venue_id, performer_id=performer_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Remove a subscription."""
    sub = db.get(Subscription, subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"message": "Unsubscribed successfully"}
