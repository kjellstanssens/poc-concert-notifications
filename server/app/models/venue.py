from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from .province import Province

class Venue(Base):
    __tablename__ = "venues"
    name = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=True)
    province = Column(SQLEnum(Province), nullable=False)
    address = Column(String, nullable=True)

    website_url = Column(String, nullable=False) 

    concerts = relationship("Concert", back_populates="venue")