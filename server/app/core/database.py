import os
from sqlalchemy import Column, DateTime, Integer, create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.sql import func
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Simplified fallback for SQLite local path
DEFAULT_DB = "sqlite:///c:/Users/Gebruiker/Desktop/BAP/poc-concert-notifications/server/data/app.db"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB)

# Ensure path works for SQLite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())    

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()