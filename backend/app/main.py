from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List
import os
import asyncio
from dotenv import load_dotenv
from datetime import datetime
import uuid

from .ml_service import ml_service
from .cloudinary_service import cloudinary_service
from .recommendations import get_recommendations

load_dotenv()

app = FastAPI(
    title="TomatoGuard API",
    description="Tomato Plant Disease Detection System",
    version="1.0.0"
)

# Request queue for ML predictions (max 3 concurrent)
ml_queue = asyncio.Queue()
ml_semaphore = asyncio.Semaphore(3)  # Allow max 3 concurrent ML predictions
queue_stats = {
    "total_processed": 0,
    "currently_processing": 0,
    "queued": 0,
    "requests": {}
}

# CORS configuration - Support Ngrok URLs dynamically
def get_cors_origins():
    """Get CORS origins from environment, including Ngrok support"""
    default_origins = [
        "http://localhost:5173", # localhost port 5173
        "http://localhost:3000",
        "http://localhost:19006", 
        "http://127.0.0.1:19006", # localhost ip address port 19006
        "http://localhost:8081", # localhost port 8081
        "http://127.0.0.1:8081", # localhost ip address
        "exp://192.168.100.97:8081", # my local machine ip address sa bahay
        "https://*.ngrok-free.dev",  # Your ngrok domain
        "https://dori-unmutational-johnathon.ngrok-free.dev",  # Your specific URL
    ]
    
    # Add Ngrok URL if provided
    ngrok_url = os.getenv("NGROK_URL", "")
    if ngrok_url:
        # Add both http and https versions
        default_origins.append(ngrok_url)
        if ngrok_url.startswith("https://"):
            default_origins.append(ngrok_url.replace("https://", "http://"))
    
    # Add custom origins from env
    env_origins = os.getenv("ALLOWED_ORIGINS", "")
    if env_origins:
        default_origins.extend(env_origins.split(","))
    
    # Remove duplicates and empty strings
    origins = list(set([o.strip() for o in default_origins if o.strip()]))
    
    return origins

# Get CORS origins
cors_origins = get_cors_origins()
ngrok_url = os.getenv("NGROK_URL", "")
ngrok_mode = os.getenv("NGROK_MODE", "false").lower() == "true" or ngrok_url

# CORS configuration
# For development: Allow all origins to support ngrok and local development
# Note: allow_origins=["*"] doesn't work with allow_credentials=True
# So we use a regex pattern that matches all origins
# In production, you should restrict this to specific domains
# This configuration allows all endpoints including /api/analyze/batch
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",  # Allow all origins (for development/ngrok and localhost)
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly allow all methods
    allow_headers=["*"],  # Allow all headers including Content-Type for file uploads
    expose_headers=["*"],  # Expose all headers in response
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

async def process_ml_prediction(request_id: str, contents: bytes):
    """Process ML prediction with queuing"""
    async with ml_semaphore:
        queue_stats["currently_processing"] += 1
        queue_stats["requests"][request_id] = {
            "status": "processing",
            "started_at": datetime.now().isoformat()
        }
        
        try:
            # Upload to Cloudinary
            upload_result = cloudinary_service.upload_image(contents)
            
            # Analyze image (this is the CPU-intensive operation)
            result = ml_service.analyze_image(contents)
            
            queue_stats["requests"][request_id] = {
                "status": "completed",
                "started_at": queue_stats["requests"][request_id]["started_at"],
                "completed_at": datetime.now().isoformat()
            }
            queue_stats["total_processed"] += 1
            
            return {
                "status": "success",
                "analysis": result,
                "upload_info": upload_result,
                "request_id": request_id
            }
        except Exception as e:
            queue_stats["requests"][request_id] = {
                "status": "error",
                "error": str(e),
                "started_at": queue_stats["requests"][request_id]["started_at"],
                "completed_at": datetime.now().isoformat()
            }
            raise
        finally:
            queue_stats["currently_processing"] -= 1
            # Clean up old requests (keep last 100)
            if len(queue_stats["requests"]) > 100:
                oldest = min(queue_stats["requests"].keys(), 
                           key=lambda k: queue_stats["requests"][k].get("started_at", ""))
                del queue_stats["requests"][oldest]

@app.post("/api/analyze/upload")
async def analyze_uploaded_image(file: UploadFile = File(...)):
    """Upload and analyze image directly with queuing"""
    request_id = str(uuid.uuid4())
    
    try:
        # Read file
        contents = await file.read()
        
        # Process with queue
        result = await process_ml_prediction(request_id, contents)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/batch")
async def analyze_multiple_images(files: List[UploadFile] = File(...)):
    """Analyze multiple images at once with queuing
    Supports CORS for ngrok and localhost origins"""
    results = []
    
    for file in files:
        request_id = str(uuid.uuid4())
        try:
            contents = await file.read()
            
            # Process with queue
            result = await process_ml_prediction(request_id, contents)
            
            results.append({
                "filename": file.filename,
                "upload_info": result.get("upload_info"),
                "analysis": result.get("analysis"),
                "request_id": request_id
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "request_id": request_id
            })
    
    return {"results": results}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": len(ml_service.models) > 0,
        "models": list(ml_service.models.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/queue/status")
async def queue_status():
    """Get ML prediction queue status"""
    queue_stats["queued"] = ml_queue.qsize()
    return {
        "queue_status": {
            "currently_processing": queue_stats["currently_processing"],
            "queued": queue_stats["queued"],
            "max_concurrent": 3,
            "total_processed": queue_stats["total_processed"]
        },
        "recent_requests": dict(list(queue_stats["requests"].items())[-10:]),  # Last 10 requests
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )