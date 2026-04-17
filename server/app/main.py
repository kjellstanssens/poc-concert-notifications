from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import Concert, Venue, Performer
from app.api import api_router

# Create tables if they don't exist (Backup for migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Concert Monitor API")

# Include all endpoint routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Concert Monitor API is up and running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}