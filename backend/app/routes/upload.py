from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.cloudinary_service import cloudinary_service

router = APIRouter()

@router.get("/api/config/cloudinary")
async def get_cloudinary_config():
    config = cloudinary_service.get_upload_config()
    return JSONResponse(content=config)