from sqlalchemy import Column, Integer, String, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from .province import Province

class Venue(Base):
    __tablename__ = "venues"
    name = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=True) # Making nullable for auto-scrapers
    postal_code = Column(String, nullable=True)
    province = Column(SQLEnum(Province), nullable=True)
    address = Column(String, nullable=True)

    website_url = Column(String, nullable=False) 
    
    # Scraper Configuration Fields
    is_active = Column(Boolean, default=True)
    scraper_config = Column(JSON, nullable=True) # Stores selectors, date_parsing, etc.
    last_scraped_at = Column(String, nullable=True)

    concerts = relationship("Concert", back_populates="venue")