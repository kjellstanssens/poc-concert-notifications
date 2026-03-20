from pydantic import BaseModel, HttpUrl, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.province import Province

class VenueBase(BaseModel):
    name: str
    city: str
    province: Province
    address: Optional[str] = None
    postal_code: Optional[str] = None
    website_url: HttpUrl

class VenueCreate(VenueBase):
    pass

class Venue(VenueBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)