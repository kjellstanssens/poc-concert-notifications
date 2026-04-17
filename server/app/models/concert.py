from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .assocations import concert_performers

class Concert(Base):
    __tablename__ = "concerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=True)
    url = Column(String, index=True, nullable=True) # Stable identifier (external_id)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)

    content_hash = Column(String, index=True, nullable=True)
    status = Column(String, default="active", nullable=False) # active, cancelled, rescheduled
    last_scraped_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    venue = relationship("Venue", back_populates="concerts")
    performers = relationship("Performer", secondary=concert_performers, back_populates="concerts")



