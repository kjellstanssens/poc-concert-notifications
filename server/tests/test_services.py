import pytest
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session
from app import schemas, services
from app.models.province import Province
from app.models.concert import Concert
from app.models.performer import Performer
from app.models.venue import Venue as VenueModel
from app.core.database import SessionLocal

@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session for each test."""
    db = SessionLocal()
    try:
        # Start a nested transaction to allow for rollback after each test
        # Note: This is a common pattern to keep the DB clean between tests
        # Without having to drop/recreate tables
        yield db
    finally:
        # Rollback all changes made during the test
        db.rollback()
        db.close()

# --- Venue Service Tests ---

def test_create_venue(db_session: Session):
    venue_in = schemas.venue.VenueCreate(
        name="Ancienne Belgique",
        city="Brussels",
        province=Province.ANTWERP,
        address="Anspachlaan 110",
        postal_code="1000",
        website_url="https://www.abconcerts.be"
    )
    
    venue = services.create_venue(db_session, venue_in)
    
    assert venue.id is not None
    assert venue.name == "Ancienne Belgique"
    assert venue.province == Province.ANTWERP
    assert str(venue.website_url).rstrip("/") == "https://www.abconcerts.be"

def test_get_venue_by_name_case_insensitive(db_session: Session):
    # Setup
    venue_in = schemas.venue.VenueCreate(
        name="Botanique",
        city="Brussels",
        province=Province.ANTWERP,
        website_url="https://botanique.be"
    )
    services.create_venue(db_session, venue_in)
    
    # Test case insensitivity
    venue_exact = services.get_venue_by_name(db_session, "Botanique")
    venue_lower = services.get_venue_by_name(db_session, "botanique")
    venue_upper = services.get_venue_by_name(db_session, "BOTANIQUE")
    
    assert venue_exact is not None
    assert venue_lower is not None
    assert venue_upper is not None
    assert venue_exact.id == venue_lower.id == venue_upper.id

# --- Performer Service Tests ---

def test_get_or_create_performer_idempotency(db_session: Session):
    performer_in = schemas.performer.PerformerCreate(name="Arctic Monkeys")
    
    # First call - creates new record
    performer1 = services.get_or_create_performer(db_session, performer_in)
    assert performer1.id is not None
    
    # Second call - returns same record
    performer2 = services.get_or_create_performer(db_session, performer_in)
    assert performer1.id == performer2.id
    
    # Verify only one record exists in DB
    performers = services.get_all_performers(db_session)
    count = sum(1 for p in performers if p.name == "Arctic Monkeys")
    assert count == 1

# --- Concert Service Tests ---

def test_create_concert_with_performers(db_session: Session):
    # Setup dependencies
    venue_in = schemas.venue.VenueCreate(
        name="Vooruit",
        city="Ghent",
        province=Province.WEST_FLANDERS,
        website_url="https://viernulvier.gent"
    )
    venue = services.create_venue(db_session, venue_in)
    
    p1 = services.get_or_create_performer(db_session, schemas.performer.PerformerCreate(name="Band A"))
    p2 = services.get_or_create_performer(db_session, schemas.performer.PerformerCreate(name="Band B"))
    
    # Create concert
    concert_in = schemas.concert.ConcertCreate(
        title="Epic Night",
        date=datetime.now() + timedelta(days=30),
        venue_id=venue.id,
        performer_ids=[p1.id, p2.id],
        content_hash="unique_hash_123"
    )
    
    concert = services.create_concert(db_session, concert_in)
    
    assert concert.id is not None
    assert len(concert.performers) == 2
    assert any(p.name == "Band A" for p in concert.performers)
    assert any(p.name == "Band B" for p in concert.performers)
    assert concert.venue.name == "Vooruit"

def test_get_active_concerts_filtering(db_session: Session):
    # Setup venue
    venue = services.create_venue(db_session, schemas.venue.VenueCreate(
        name="Test Venue", city="Test City", province=Province.LIMBURG, website_url="https://test.be"
    ))
    
    # 1. Past concert (should be filtered out by date)
    services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="Past Show", date=datetime.now() - timedelta(days=1),
        venue_id=venue.id, performer_ids=[], content_hash="hash_past"
    ))
    
    # 2. Future inactive concert (should be filtered out by is_active)
    inactive_concert = services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="Inactive Show", date=datetime.now() + timedelta(days=5),
        venue_id=venue.id, performer_ids=[], content_hash="hash_inactive"
    ))
    services.soft_delete_concert(db_session, inactive_concert.id)
    
    # 3. Future active concert (should be returned)
    services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="Active Future Show", date=datetime.now() + timedelta(days=10),
        venue_id=venue.id, performer_ids=[], content_hash="hash_active"
    ))
    
    active_concerts = services.get_active_concerts(db_session)
    
    assert len(active_concerts) == 1
    assert active_concerts[0].title == "Active Future Show"

def test_soft_delete_concert(db_session: Session):
    # Setup
    venue = services.create_venue(db_session, schemas.venue.VenueCreate(
        name="Delete Venue", city="City", province=Province.ANTWERP, website_url="https://del.be"
    ))
    concert = services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="To Delete", date=datetime.now() + timedelta(days=1),
        venue_id=venue.id, performer_ids=[], content_hash="hash_to_delete"
    ))
    
    # Act
    success = services.soft_delete_concert(db_session, concert.id)
    
    # Assert
    assert success is True
    
    # Verify item is still in DB but inactive
    stmt = select(Concert).where(Concert.id == concert.id)
    db_concert = db_session.execute(stmt).scalar_one()
    assert db_concert.is_active is False
    
    # Verify not found if ID is invalid
    assert services.soft_delete_concert(db_session, 99999) is False
