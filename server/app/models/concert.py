import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime, UTC
from app.core.database import Base
from .assocations import concert_performers

def utcnow():
    return datetime.now(UTC).replace(tzinfo=None)

class Concert(Base):
    __tablename__ = "concerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)
    url = Column(String, index=True, nullable=True) # Stable identifier (external_id)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)

    content_hash = Column(String, index=True, nullable=True)
    status = Column(String, default="active", nullable=False) # active, cancelled, rescheduled
    last_scraped_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    venue = relationship("Venue", back_populates="concerts")
    performers = relationship("Performer", secondary=concert_performers, back_populates="concerts")

    # Association proxy to get IDs directly
    performer_ids = association_proxy("performers", "id")



