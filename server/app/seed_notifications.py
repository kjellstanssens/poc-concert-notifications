from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.user import User
from app.models.subscription import Subscription
from app.models.performer import Performer
from app.models.venue import Venue

def seed_notifications():
    db = SessionLocal()
    try:
        # Create a test user
        user = db.execute(select(User).where(User.email == "test@example.com")).scalar_one_or_none()
        if not user:
            user = User(email="test@example.com")
            db.add(user)
            db.flush()
            print(f"Created user: {user.email}")

        # Subscribe them to a venue (Ancienne Belgique - ID 1 usually)
        ab_venue = db.execute(select(Venue).where(Venue.name == "Ancienne Belgique")).scalar_one_or_none()
        if ab_venue:
            existing = db.execute(
                select(Subscription).where(
                    Subscription.user_id == user.id,
                    Subscription.venue_id == ab_venue.id
                )
            ).first()
            if not existing:
                sub = Subscription(user_id=user.id, venue_id=ab_venue.id)
                db.add(sub)
                print(f"Subscribed {user.email} to {ab_venue.name}")

        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_notifications()
