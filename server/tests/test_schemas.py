import pytest
from datetime import datetime
from pydantic import ValidationError
from app.schemas.venue import VenueCreate, Venue, VenueBase
from app.schemas.performer import PerformerCreate, Performer, PerformerBase
from app.schemas.concert import ConcertCreate, Concert, ConcertBase
from app.models.province import Province

# Venue Schema Tests
def test_venue_schema_valid():
    venue_data = {
        "name": "Ancienne Belgique",
        "city": "Brussels",
        "province": Province.ANTWERP, 
        "address": "Anspachlaan 110",
        "postal_code": "1000",
        "website_url": "https://www.abconcerts.be"
    }
    venue = VenueCreate(**venue_data)
    assert venue.name == "Ancienne Belgique"
    assert str(venue.website_url).rstrip("/") == "https://www.abconcerts.be"

def test_venue_schema_invalid_url():
    venue_data = {
        "name": "AB",
        "city": "Brussels",
        "province": Province.ANTWERP,
        "website_url": 123 # Invalid type for URL string
    }
    with pytest.raises(ValidationError):
        VenueCreate(**venue_data)

def test_venue_schema_missing_required():
    venue_data = {
        "name": "Ancienne Belgique",
        "city": "Brussels"
    }
    with pytest.raises(ValidationError):
        VenueCreate(**venue_data)

# Performer Schema Tests
def test_performer_schema_valid():
    performer_data = {"name": "Arctic Monkeys"}
    performer = PerformerCreate(**performer_data)
    assert performer.name == "Arctic Monkeys"

def test_performer_schema_invalid():
    with pytest.raises(ValidationError):
        PerformerCreate(name=None)
    with pytest.raises(ValidationError):
        PerformerCreate()

# Concert Schema Tests
def test_concert_schema_valid():
    concert_data = {
        "title": "AM Tour",
        "date": datetime(2024, 5, 20, 20, 0),
        "price": 50.0,
        "content_hash": "abc123hash"
    }
    concert = ConcertBase(**concert_data)
    assert concert.title == "AM Tour"

def test_concert_create_schema_valid():
    concert_data = {
        "title": "AM Tour",
        "date": datetime(2024, 5, 20, 20, 0),
        "venue_id": 1,
        "performer_ids": [1, 2]
    }
    concert = ConcertCreate(**concert_data)
    assert concert.venue_id == 1

def test_concert_schema_missing_required():
    with pytest.raises(ValidationError):
        ConcertCreate(venue_id=1)
    with pytest.raises(ValidationError):
        ConcertCreate(title="Test", date=datetime.now())

def test_concert_schema_optional_fields():
    concert_data = {
        "title": "Minimal Concert",
        "date": "2024-05-20T20:00:00",
        "venue_id": 1
    }
    concert = ConcertCreate(**concert_data)
    assert concert.price is None
    assert concert.content_hash is None
    assert concert.performer_ids == []

# Test ORM mode (from_attributes)
def test_venue_orm_mode():
    class MockVenue:
        id = 1
        name = "AB"
        city = "Brussels"
        province = Province.ANTWERP
        address = None
        postal_code = None
        website_url = "https://ab.be"
        is_active = True
        created_at = datetime.now()
        updated_at = datetime.now()

    venue_orm = Venue.model_validate(MockVenue())
    assert venue_orm.id == 1
    assert venue_orm.name == "AB"
