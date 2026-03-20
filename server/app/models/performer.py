from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from .assocations import concert_performers

class Performer(Base):
    __tablename__ = "performers"
    name = Column(String, unique=True, index=True, nullable=False)
    
    concerts = relationship("Concert", secondary=concert_performers, back_populates="performers")