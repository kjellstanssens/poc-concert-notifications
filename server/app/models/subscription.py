from sqlalchemy import Column, Integer, ForeignKey, String, or_
from sqlalchemy.orm import relationship
from app.core.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    performer_id = Column(Integer, ForeignKey("performers.id"), nullable=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=True)
    province = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    performer = relationship("Performer")
    venue = relationship("Venue")

    @classmethod
    def find_matching_users(cls, db_session, venue_id, performer_ids):
        """
        Encapsulates the logic to find all users subscribed to a venue or performers.
        """
        stmt = (
            db_session.query(cls.user_id)
            .filter(
                or_(
                    cls.venue_id == venue_id,
                    cls.performer_id.in_(performer_ids) if performer_ids else False
                )
            )
            .distinct()
        )
        return [row[0] for row in stmt.all()]
