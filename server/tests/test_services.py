import pytest
import uuid
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
    """Provides a transactional database session for each test that rolls back."""
    connection = SessionLocal().get_bind().connect()
    transaction = connection.begin()
    db = Session(bind=connection)
    
    try:
        yield db
    finally:
        db.close()
        transaction.rollback()
        connection.close()

# --- Venue Service Tests ---

def test_create_venue(db_session: Session):
    venue_name = f"Ancienne Belgique {uuid.uuid4()}"
    venue_in = schemas.venue.VenueCreate(
        name=venue_name,
        city="Brussels",
        province=Province.ANTWERP,
        address="Anspachlaan 110",
        postal_code="1000",
        website_url="https://www.abconcerts.be"
    )
    
    venue = services.create_venue(db_session, venue_in)
    
    assert venue.id is not None
    assert venue.name == venue_name
    assert venue.province == Province.ANTWERP
    assert str(venue.website_url).rstrip("/") == "https://www.abconcerts.be"

def test_get_venue_by_name_case_insensitive(db_session: Session):
    # Setup
    unique_name = f"Botanique_{uuid.uuid4().hex[:8]}"
    venue_in = schemas.venue.VenueCreate(
        name=unique_name,
        city="Brussels",
        province=Province.ANTWERP,
        website_url="https://botanique.be"
    )
    services.create_venue(db_session, venue_in)
    
    # Test case insensitivity
    venue_exact = services.get_venue_by_name(db_session, unique_name)
    venue_lower = services.get_venue_by_name(db_session, unique_name.lower())
    venue_upper = services.get_venue_by_name(db_session, unique_name.upper())
    
    assert venue_exact is not None
    assert venue_lower is not None
    assert venue_upper is not None
    assert venue_exact.id == venue_lower.id == venue_upper.id

# --- Performer Service Tests ---

def test_get_or_create_performer_idempotency(db_session: Session):
    unique_name = f"Arctic Monkeys {uuid.uuid4()}"
    performer_in = schemas.performer.PerformerCreate(name=unique_name)
    
    # First call - creates new record
    performer1 = services.get_or_create_performer(db_session, performer_in)
    assert performer1.id is not None
    
    # Second call - returns same record
    performer2 = services.get_or_create_performer(db_session, performer_in)
    assert performer1.id == performer2.id
    
    # Verify only one record exists in DB
    performers = services.get_all_performers(db_session)
    count = sum(1 for p in performers if p.name == unique_name)
    assert count == 1

# --- Concert Service Tests ---

def test_create_concert_with_performers(db_session: Session):
    # Setup dependencies
    venue_in = schemas.venue.VenueCreate(
        name=f"Vooruit {uuid.uuid4()}",
        city="Ghent",
        province=Province.WEST_FLANDERS,
        website_url="https://viernulvier.gent"
    )
    venue = services.create_venue(db_session, venue_in)
    
    p1 = services.get_or_create_performer(db_session, schemas.performer.PerformerCreate(name=f"Band A {uuid.uuid4()}"))
    p2 = services.get_or_create_performer(db_session, schemas.performer.PerformerCreate(name=f"Band B {uuid.uuid4()}"))
    
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
    assert any(p.name.startswith("Band A") for p in concert.performers)
    assert any(p.name.startswith("Band B") for p in concert.performers)
    assert concert.venue.name.startswith("Vooruit")

def test_get_active_concerts_filtering(db_session: Session):
    # Setup venue
    unique_venue_name = f"Venue_Active_{uuid.uuid4().hex[:8]}"
    venue = services.create_venue(db_session, schemas.venue.VenueCreate(
        name=unique_venue_name, city="Test City", province=Province.LIMBURG, website_url="https://test.be"
    ))
    
    # 1. Past concert (should be filtered out by date)
    services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="Past Show", date=datetime.now() - timedelta(days=1),
        venue_id=venue.id, performer_ids=[], content_hash=f"hash_past_{uuid.uuid4().hex[:8]}"
    ))
    
    # 2. Future inactive concert (should be filtered out by is_active)
    inactive_concert = services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="Inactive Show", date=datetime.now() + timedelta(days=5),
        venue_id=venue.id, performer_ids=[], content_hash=f"hash_inactive_{uuid.uuid4().hex[:8]}"
    ))
    services.soft_delete_concert(db_session, inactive_concert.id)
    
    # 3. Future active concert (should be returned)
    unique_title = f"Active Future Show {uuid.uuid4().hex[:8]}"
    services.create_concert(db_session, schemas.concert.ConcertCreate(
        title=unique_title, date=datetime.now() + timedelta(days=10),
        venue_id=venue.id, performer_ids=[], content_hash=f"hash_active_{uuid.uuid4().hex[:8]}"
    ))
    
    active_concerts = services.get_active_concerts(db_session)
    
    # Check if our specific concert is in the results (there might be others from other tests)
    titles = [c.title for c in active_concerts]
    assert unique_title in titles
    assert "Past Show" not in titles

def test_soft_delete_concert(db_session: Session):
    # Setup
    unique_venue_name = f"Delete Venue {uuid.uuid4().hex[:8]}"
    venue = services.create_venue(db_session, schemas.venue.VenueCreate(
        name=unique_venue_name, city="City", province=Province.ANTWERP, website_url="https://del.be"
    ))
    unique_hash = f"hash_del_{uuid.uuid4().hex[:8]}"
    concert = services.create_concert(db_session, schemas.concert.ConcertCreate(
        title="To Delete", date=datetime.now() + timedelta(days=1),
        venue_id=venue.id, performer_ids=[], content_hash=unique_hash
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
