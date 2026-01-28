from typing import List
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime

from app.schemas.analysis import ImageUrlRequest
from app.services.ml_service import ml_service
from app.utils.queue import process_ml_prediction, get_queue_status

router = APIRouter()

@router.post("/api/analyze/image")
async def analyze_image_from_url(data: ImageUrlRequest):
    try:
        import requests

        response = requests.get(data.url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")

        result = ml_service.analyze_image(response.content)

        return {
            "status": "success",
            "analysis": result,
            "image_url": data.url,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/upload")
async def analyze_uploaded_image(file: UploadFile = File(...)):
    request_id = str(uuid4())
    try:
        contents = await file.read()
        result = await process_ml_prediction(request_id, contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/batch")
async def analyze_multiple_images(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        request_id = str(uuid4())
        try:
            contents = await file.read()
            result = await process_ml_prediction(request_id, contents)
            results.append({
                "filename": file.filename,
                "upload_info": result.get("upload_info"),
                "analysis": result.get("analysis"),
                "request_id": request_id,
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "request_id": request_id,
            })
    return {"results": results}

@router.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(ml_service.models) > 0,
        "models": list(ml_service.models.keys()),
        "timestamp": datetime.now().isoformat(),
    }

@router.get("/api/queue/status")
async def queue_status():
    return get_queue_status()