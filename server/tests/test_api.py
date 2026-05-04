import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import SessionLocal, Base, engine
import uuid

# Setup an isolated database for API tests
@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    # We keep data between tests in session but could drop here if needed
    # Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def client():
    """Provides an AsyncClient for testing the FastAPI app."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_root_and_health(client: AsyncClient):
    # Test Root
    resp = await client.get("/")
    assert resp.status_code == 200
    assert "up and running" in resp.json()["message"]

    # Test Health
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"

@pytest.mark.anyio
async def test_user_flow(client: AsyncClient):
    email = f"test_{uuid.uuid4().hex}@example.com"
    
    # 1. Create User
    resp = await client.post("/api/v1/users/", json={"email": email})
    assert resp.status_code == 200
    user_data = resp.json()
    assert user_data["email"] == email
    user_id = user_data["id"]

    # 2. Get User
    resp = await client.get(f"/api/v1/users/{email}")
    assert resp.status_code == 200
    assert resp.json()["id"] == user_id

@pytest.mark.anyio
async def test_venue_and_performer_list(client: AsyncClient):
    # Test Venues List
    resp = await client.get("/api/v1/venues/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # Test Performers List
    resp = await client.get("/api/v1/performers/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

@pytest.mark.anyio
async def test_subscription_creation(client: AsyncClient):
    # Setup: Ensure a user exists
    email = f"sub_{uuid.uuid4().hex}@example.com"
    user_resp = await client.post("/api/v1/users/", json={"email": email})
    user_id = user_resp.json()["id"]

    # Setup: Ensure a performer exists
    perf_name = f"Artist_{uuid.uuid4().hex}"
    perf_resp = await client.post("/api/v1/performers/", json={"name": perf_name})
    performer_id = perf_resp.json()["id"]

    # Act: Subscribe
    sub_payload = {
        "user_id": user_id,
        "performer_id": performer_id
    }
    resp = await client.post("/api/v1/subscriptions/performer", json=sub_payload)
    
    assert resp.status_code == 200
    assert "id" in resp.json() or "message" in resp.json()

@pytest.mark.anyio
async def test_concert_list(client: AsyncClient):
    # Test Concerts endpoint
    resp = await client.get("/api/v1/concerts/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
