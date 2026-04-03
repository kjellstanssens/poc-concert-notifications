from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .assocations import concert_performers

class Concert(Base):
    __tablename__ = "concerts"
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)

    content_hash = Column(String, index=True, nullable=True)
    is_active = Column(Integer, default=True, nullable=False) # Added is_active for soft delete

    venue = relationship("Venue", back_populates="concerts")
    performers = relationship("Performer", secondary=concert_performers, back_populates="concerts")



