from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.user import User
from app import schemas

router = APIRouter()

@router.post("/", response_model=schemas.User)
def get_or_create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Simple endpoint to identify/create a user by email."""
    email = user_in.email
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/{email}", response_model=schemas.User)
def get_user(email: str, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
