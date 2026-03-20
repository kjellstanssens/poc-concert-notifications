
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Table

from app.core.database import Base

concert_performers = Table(
    "concert_performers",
    Base.metadata,
    Column("concert_id", Integer, ForeignKey("concerts.id"), primary_key=True),
    Column("performer_id", Integer, ForeignKey("performers.id"), primary_key=True),
)