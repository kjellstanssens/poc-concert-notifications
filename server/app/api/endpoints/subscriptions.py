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

@router.post("/performer")
def subscribe_to_performer(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Subscribe a user to a performer."""
    user_id = payload.get("user_id")
    performer_id = payload.get("performer_id")
    
    if not user_id or not performer_id:
        raise HTTPException(status_code=400, detail="Missing user_id or performer_id")
    
    # Check for existing
    from sqlalchemy import and_
    existing = db.execute(
        select(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                Subscription.performer_id == performer_id
            )
        )
    ).scalar_one_or_none()
    
    if existing:
        return {"message": "Already subscribed", "id": existing.id}
        
    sub = Subscription(user_id=user_id, performer_id=performer_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.post("/venue")
def subscribe_to_venue(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Subscribe a user to a venue."""
    user_id = payload.get("user_id")
    venue_id = payload.get("venue_id")
    
    if not user_id or not venue_id:
        raise HTTPException(status_code=400, detail="Missing user_id or venue_id")
    
    # Check for existing
    from sqlalchemy import and_
    existing = db.execute(
        select(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                Subscription.venue_id == venue_id
            )
        )
    ).scalar_one_or_none()
    
    if existing:
        return {"message": "Already subscribed", "id": existing.id}
        
    sub = Subscription(user_id=user_id, venue_id=venue_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/user/{user_id}")
def list_user_subscriptions(user_id: int, db: Session = Depends(get_db)):
    """List all subscriptions for a given user, including performer and venue details."""
    from sqlalchemy.orm import joinedload
    subs = db.execute(
        select(Subscription)
        .options(joinedload(Subscription.performer), joinedload(Subscription.venue))
        .where(Subscription.user_id == user_id)
    ).scalars().all()
    return subs

@router.delete("/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    """Remove a subscription."""
    sub = db.get(Subscription, subscription_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"message": "Unsubscribed successfully"}
