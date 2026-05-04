from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_, and_
from datetime import datetime
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.subscription import Subscription
from app.models.notification import NotificationQueue
from app.models.concert import Concert
from app.services.mailer import send_daily_digest

@celery_app.task(name="app.services.matcher.process_daily_digests")
def process_daily_digests():
    """
    Finds all users with pending notifications and sends them a combined email.
    """
    db = SessionLocal()
    try:
        # Find all users who have at least one unsent notification
        users_with_notifications = db.execute(
            select(User)
            .join(NotificationQueue)
            .where(NotificationQueue.sent_at == None)
            .distinct()
        ).scalars().all()

        for user in users_with_notifications:
            # Batch items for this user
            notifications = db.execute(
                select(NotificationQueue)
                .options(
                    joinedload(NotificationQueue.concert).joinedload(Concert.venue)
                )
                .where(
                    and_(
                        NotificationQueue.user_id == user.id,
                        NotificationQueue.sent_at == None
                    )
                )
            ).scalars().all()

            if notifications:
                success = send_daily_digest(user.email, notifications)
                if success:
                    # Mark as sent
                    now = datetime.utcnow()
                    for n in notifications:
                        n.sent_at = now
                    db.commit()
    finally:
        db.close()

def queue_notifications_for_concert(db: Session, concert_id: int, notification_type: str):
    """
    Finds all users who should be notified for this concert and queues a notification.
    Uses the Subscription model's encapsulated logic.
    """
    concert = db.execute(
        select(Concert).where(Concert.id == concert_id)
    ).scalar_one_or_none()
    
    if not concert:
        return

    # Call the encapsulated matching logic using the new property
    user_ids = Subscription.find_matching_users(db, concert.venue_id, concert.performer_ids)
    
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
