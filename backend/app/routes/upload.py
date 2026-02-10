from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.services.cloudinary_service import cloudinary_service
from app.dependencies.auth import get_current_active_user

router = APIRouter()

@router.get("/api/config/cloudinary")
async def get_cloudinary_config():
    config = cloudinary_service.get_upload_config()
    return JSONResponse(content=config)


@router.post("/api/v1/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Upload an image to Cloudinary (for profile pictures, etc.)
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    contents = await file.read()
    
    # Upload to Cloudinary
    try:
        result = cloudinary_service.upload_image(contents)
        return {
            "url": result["url"],
            "public_id": result["public_id"],
            "format": result.get("format"),
            "width": result.get("width"),
            "height": result.get("height")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")