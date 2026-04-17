from typing import List, Optional
from pydantic import BaseModel, HttpUrl

class SelectorConfig(BaseModel):
    card: str
    title: str
    date: str
    url: Optional[str] = None
    price: Optional[str] = None

class DateParsingConfig(BaseModel):
    type: str  # "iso" or "format"
    format: Optional[str] = None
    locale: Optional[str] = "en"
    attr: Optional[str] = None

class PerformerStrategy(BaseModel):
    split_by: List[str] = []

class VenueScraperConfig(BaseModel):
    venue_name: str
    start_url: HttpUrl
    selectors: SelectorConfig
    date_parsing: DateParsingConfig
    performer_strategy: PerformerStrategy
