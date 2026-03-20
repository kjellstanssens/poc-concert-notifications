from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .venue import Venue
from .performer import Performer

class ConcertBase(BaseModel):
    title: str
    date: datetime
    price: Optional[float] = None
    content_hash: Optional[str] = None

class ConcertCreate(ConcertBase):
    venue_id: int
    performer_ids: List[int] = []

class Concert(ConcertBase):
    id: int
    created_at: datetime
    updated_at: datetime
    venue_id: int
    venue: Venue
    performers: List[Performer] = []

    model_config = ConfigDict(from_attributes=True)