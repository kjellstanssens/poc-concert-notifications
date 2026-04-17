from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from app.models.user import User
from app.models.subscription import Subscription
from app.models.notification import NotificationQueue
from app.models.concert import Concert

def queue_notifications_for_concert(db: Session, concert_id: int, notification_type: str):
    """
    Finds all users who should be notified for this concert and queues a notification.
    A user is notified if they have a subscription to:
    1. The venue of the concert
    2. Any of the performers in the concert
    """
    concert = db.execute(
        select(Concert).where(Concert.id == concert_id)
    ).scalar_one_or_none()
    
    if not concert:
        return

    # Find subscriptions matching venue OR performers
    performer_ids = [p.id for p in concert.performers]
    
    stmt = select(Subscription.user_id).where(
        or_(
            Subscription.venue_id == concert.venue_id,
            Subscription.performer_id.in_(performer_ids) if performer_ids else False
        )
    ).distinct()
    
    user_ids = db.execute(stmt).scalars().all()
    
    for u_id in user_ids:
        # Check if already in queue for this concert (avoid duplicates in same 24h batch)
        existing = db.execute(
            select(NotificationQueue).where(
                NotificationQueue.user_id == u_id,
                NotificationQueue.concert_id == concert_id,
                NotificationQueue.sent_at == None
            )
        ).first()
        
        if not existing:
            new_notif = NotificationQueue(
                user_id=u_id,
                concert_id=concert_id,
                change_type=notification_type
            )
            db.add(new_notif)
    
    db.commit()
