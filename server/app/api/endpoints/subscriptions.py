from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.models.subscription import Subscription
from app.models.user import User

router = APIRouter()

@router.post("/performer")
def subscribe_to_performer(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Subscribe a user to a performer, optionally filtered by venue or province."""
    user_id = payload.get("user_id")
    performer_id = payload.get("performer_id")
    venue_id = payload.get("venue_id")
    province = payload.get("province")
    
    if not user_id or not performer_id:
        raise HTTPException(status_code=400, detail="Missing user_id or performer_id")
    
    # Check for existing
    from sqlalchemy import and_
    existing = db.execute(
        select(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                Subscription.performer_id == performer_id,
                Subscription.venue_id == venue_id,
                Subscription.province == province
            )
        )
    ).scalar_one_or_none()
    
    if existing:
        return {"message": "Already subscribed", "id": existing.id}
        
    sub = Subscription(
        user_id=user_id, 
        performer_id=performer_id,
        venue_id=venue_id,
        province=province
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.post("/province")
def subscribe_to_province(
    payload: dict,
    db: Session = Depends(get_db)
):
    """Subscribe a user to all events in a province."""
    user_id = payload.get("user_id")
    province = payload.get("province")
    
    if not user_id or not province:
        raise HTTPException(status_code=400, detail="Missing user_id or province")
    
    # Check for existing
    from sqlalchemy import and_
    existing = db.execute(
        select(Subscription).where(
            and_(
                Subscription.user_id == user_id,
                Subscription.province == province,
                Subscription.performer_id == None,
                Subscription.venue_id == None
            )
        )
    ).scalar_one_or_none()
    
    if existing:
        return {"message": "Already subscribed", "id": existing.id}
        
    sub = Subscription(user_id=user_id, province=province)
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
