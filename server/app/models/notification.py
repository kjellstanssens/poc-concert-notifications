from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class NotificationQueue(Base):
    __tablename__ = "notification_queue"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concert_id = Column(Integer, ForeignKey("concerts.id"), nullable=False)
    change_type = Column(String, nullable=False)  # "new" or "updated"
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="pending_notifications")
    concert = relationship("Concert")
