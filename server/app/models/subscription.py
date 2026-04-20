from sqlalchemy import Column, Integer, ForeignKey, String
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
