from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import Concert, Venue, Performer


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Concert Monitor API")

@app.get("/")
async def root():
    return {"message": "Concert Monitor API is up and running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}