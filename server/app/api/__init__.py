from fastapi import APIRouter
from app.api.endpoints import venues, concerts, performers

api_router = APIRouter()

api_router.include_router(venues.router, prefix="/venues", tags=["venues"])
api_router.include_router(concerts.router, prefix="/concerts", tags=["concerts"])
api_router.include_router(performers.router, prefix="/performers", tags=["performers"])
