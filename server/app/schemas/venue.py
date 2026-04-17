from pydantic import BaseModel, HttpUrl, ConfigDict
from datetime import datetime
from typing import Optional, Any
from app.models.province import Province

class VenueBase(BaseModel):
    name: str
    city: Optional[str] = None
    province: Optional[Province] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    website_url: str # Standardizing to str for flexibility

class VenueCreate(VenueBase):
    scraper_config: Optional[Any] = None
    is_active: bool = True

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    province: Optional[Province] = None
    address: Optional[str] = None
    postal_code: Optional[str] = None
    website_url: Optional[str] = None
    scraper_config: Optional[Any] = None
    is_active: Optional[bool] = None

class Venue(VenueBase):
    id: int
    is_active: bool
    scraper_config: Optional[Any] = None
    last_scraped_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)