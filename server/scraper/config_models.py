from typing import List, Optional
from pydantic import BaseModel, HttpUrl, field_validator
from datetime import datetime
import re

class SelectorConfig(BaseModel):
    card: str
    title: str
    date: str
    url: Optional[str] = None
    price: Optional[str] = None
    image: Optional[str] = None

class DateParsingConfig(BaseModel):
    type: str  # "iso" or "format"
    format: Optional[str] = None
    locale: Optional[str] = "en"
    attr: Optional[str] = None

    def parse(self, value: str) -> datetime:
        """
        Unified date parsing logic moved from the engine to the model.
        """
        if self.type == "iso":
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        
        # Try format parsing
        if self.format:
            try:
                return datetime.strptime(value.strip(), self.format)
            except ValueError as e:
                # Truncation fallback logic
                temp_str = value.strip()
                while len(temp_str) > 2:
                    try:
                        temp_str = temp_str[:-1].strip()
                        return datetime.strptime(temp_str, self.format)
                    except ValueError:
                        continue
                raise e
        raise ValueError(f"Could not parse date '{value}' with config {self}")

class ScrapedItem(BaseModel):
    """
    New model to handle item-level validation and parsing.
    Cleans up price and ensures data consistency before it leaves the engine.
    """
    title: str
    date: datetime
    url: HttpUrl
    image_url: Optional[HttpUrl] = None
    price: Optional[float] = None
    performers: List[str]
    venue_name: str
    content_hash: str

    @field_validator('price', mode='before')
    @classmethod
    def clean_price(cls, v):
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        # Handle string prices like "€ 17,50" or "26.4"
        if isinstance(v, str):
            match = re.search(r'(\d+(?:[.,]\d+)?)', v)
            if match:
                return float(match.group(1).replace(',', '.'))
        return None

class PerformerStrategy(BaseModel):
    split_by: List[str] = []

class VenueScraperConfig(BaseModel):
    venue_name: str
    start_url: HttpUrl
    selectors: SelectorConfig
    date_parsing: DateParsingConfig
    performer_strategy: PerformerStrategy
