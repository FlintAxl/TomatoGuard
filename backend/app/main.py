from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List
import os
from dotenv import load_dotenv

from .ml_service import ml_service
from .cloudinary_service import cloudinary_service
from .recommendations import get_recommendations

load_dotenv()

app = FastAPI(
    title="TomatoGuard API",
    description="Tomato Plant Disease Detection System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://localhost:19006,http://127.0.0.1:19006,http://localhost:8081,http://127.0.0.1:8081,exp://192.168.100.97:8081",
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TomatoGuard API is running"}

@app.get("/api/config/cloudinary")
async def get_cloudinary_config():
    """Get Cloudinary configuration for frontend"""
    config = cloudinary_service.get_upload_config()
    return JSONResponse(content=config)

@app.post("/api/analyze/image")
async def analyze_image_from_url(data: dict):
    """Analyze image from Cloudinary URL"""
    try:
        import requests
        from io import BytesIO
        
        # Download image from URL
        response = requests.get(data['url'])
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")
        
        # Analyze image
        result = ml_service.analyze_image(response.content)
        
        # Add recommendations
        recommendations = get_recommendations(
            result['part_detection']['part'],
            result['disease_detection']['disease'],
            result['disease_detection']['confidence']
        )
        
        return {
            "status": "success",
            "analysis": result,
            "recommendations": recommendations,
            "image_url": data['url']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/upload")
async def analyze_uploaded_image(file: UploadFile = File(...)):
    """Upload and analyze image directly"""
    try:
        # Read file
        contents = await file.read()
        
        # Upload to Cloudinary (if using)
        upload_result = cloudinary_service.upload_image(contents)
        
        # Analyze image
        result = ml_service.analyze_image(contents)
        
        # Recommendations are now included in result['recommendations']
        # from the new recommendations.py module
        
        return {
            "status": "success",
            "analysis": result,  # Already includes recommendations
            "upload_info": upload_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/batch")
async def analyze_multiple_images(files: List[UploadFile] = File(...)):
    """Analyze multiple images at once"""
    results = []
    
    for file in files:
        try:
            contents = await file.read()
            
            # Upload to Cloudinary
            upload_result = cloudinary_service.upload_image(contents)
            
            # Analyze image
            result = ml_service.analyze_image(contents)
            
            results.append({
                "filename": file.filename,
                "upload_info": upload_result,
                "analysis": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {"results": results}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(ml_service.models) > 0,
        "models": list(ml_service.models.keys())
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )