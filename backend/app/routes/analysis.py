from typing import List
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from datetime import datetime

from app.schemas.analysis import ImageUrlRequest
from app.services.ml_service import ml_service
from app.services.analysis_service import AnalysisService
from app.utils.queue import process_ml_prediction, get_queue_status
from app.dependencies.auth import get_current_active_user
from app.models.analysis_model import (
    AnalysisCreate, 
    AnalysisResponse, 
    AnalysisSummary
)

router = APIRouter()

@router.post("/api/analyze/image")
async def analyze_image_from_url(data: ImageUrlRequest, current_user: dict = Depends(get_current_active_user)):
    try:
        import requests

        response = requests.get(data.url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")

        result = ml_service.analyze_image(response.content)
        result["analyzed_by"] = current_user["id"]
        
        # Save to database
        try:
            # Get database instance
            from app.services.database import get_database
            db = get_database()
            analysis_service = AnalysisService(db)
            
            # Create analysis record
            analysis_create = AnalysisCreate(
                user_id=current_user["id"],
                image_url=data.url,
                cloudinary_public_id="",  # No Cloudinary for URL analysis
                analysis_result=result
            )
            
            saved_analysis = await analysis_service.save_analysis(analysis_create)
            
            return {
                "status": "success",
                "analysis": result,
                "image_url": data.url,
                "analysis_id": saved_analysis.id,
                "saved_to_db": True
            }
        except Exception as db_error:
            # Log database error but don't fail the analysis
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to save analysis to database: {db_error}")
            
            return {
                "status": "success",
                "analysis": result,
                "image_url": data.url,
                "saved_to_db": False,
                "db_error": str(db_error)
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/upload")
async def analyze_uploaded_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_active_user)):
    request_id = str(uuid4())
    try:
        contents = await file.read()
        result = await process_ml_prediction(request_id, contents)
        result["analyzed_by"] = current_user["id"]
        
        # Save to database
        try:
            # Get database instance
            from app.services.database import get_database
            db = get_database()
            analysis_service = AnalysisService(db)
            
            # Extract image URL and Cloudinary ID from result
            image_url = result.get("upload_info", {}).get("secure_url", "")
            cloudinary_id = result.get("upload_info", {}).get("public_id", "")
            
            # Create analysis record
            analysis_create = AnalysisCreate(
                user_id=current_user["id"],
                image_url=image_url,
                cloudinary_public_id=cloudinary_id,
                analysis_result=result
            )
            
            saved_analysis = await analysis_service.save_analysis(analysis_create)
            
            return {
                **result,
                "analysis_id": saved_analysis.id,
                "saved_to_db": True
            }
        except Exception as db_error:
            # Log database error but don't fail the analysis
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to save analysis to database: {db_error}")
            
            return {
                **result,
                "saved_to_db": False,
                "db_error": str(db_error)
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze/batch")
async def analyze_multiple_images(files: List[UploadFile] = File(...), current_user: dict = Depends(get_current_active_user)):
    results = []
    
    # Get database instance once
    analysis_service = None
    try:
        from app.services.database import get_database
        db = get_database()
        analysis_service = AnalysisService(db)
    except Exception as db_error:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to connect to database: {db_error}")
    
    for file in files:
        request_id = str(uuid4())
        try:
            contents = await file.read()
            result = await process_ml_prediction(request_id, contents)
            result["analyzed_by"] = current_user["id"]
            
            # Save to database
            saved_to_db = False
            analysis_id = None
            
            if analysis_service:
                try:
                    # Extract image URL and Cloudinary ID from result
                    image_url = result.get("upload_info", {}).get("secure_url", "")
                    cloudinary_id = result.get("upload_info", {}).get("public_id", "")
                    
                    # Create analysis record
                    analysis_create = AnalysisCreate(
                        user_id=current_user["id"],
                        image_url=image_url,
                        cloudinary_public_id=cloudinary_id,
                        analysis_result=result
                    )
                    
                    saved_analysis = await analysis_service.save_analysis(analysis_create)
                    saved_to_db = True
                    analysis_id = saved_analysis.id
                    
                except Exception as db_error:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to save batch analysis to database: {db_error}")
            
            results.append({
                "filename": file.filename,
                "upload_info": result.get("upload_info"),
                "analysis": result.get("analysis"),
                "request_id": request_id,
                "analyzed_by": current_user["id"],
                "saved_to_db": saved_to_db,
                "analysis_id": analysis_id
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "request_id": request_id,
                "saved_to_db": False
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

# ========== SIMPLE ANALYSIS MANAGEMENT ENDPOINTS ==========

@router.get("/api/analysis/history")
async def get_analysis_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_active_user)
):
    """Get user's analysis history (simple)"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        from app.services.database import get_database
        db = get_database()
        
        user_id = current_user["id"]
        logger.info(f"Fetching analysis history for user: {user_id}")
        
        # Use aggregation pipeline with projection BEFORE sort to reduce memory
        # This is required for MongoDB Atlas free tier which doesn't support allowDiskUse
        pipeline = [
            {"$match": {"user_id": user_id}},
            # Project only needed fields BEFORE sorting to reduce memory usage
            {"$project": {
                "_id": 1,
                "image_url": 1,
                "created_at": 1,
                "is_favorite": 1,
                # Handle both storage formats for disease detection
                "disease": {
                    "$ifNull": [
                        "$analysis_result.analysis.disease_detection.disease",
                        {"$ifNull": ["$analysis_result.disease_detection.disease", "Unknown"]}
                    ]
                },
                "confidence": {
                    "$ifNull": [
                        "$analysis_result.analysis.disease_detection.confidence",
                        {"$ifNull": ["$analysis_result.disease_detection.confidence", 0]}
                    ]
                }
            }},
            {"$sort": {"created_at": -1}},
            {"$skip": offset},
            {"$limit": limit}
        ]
        
        analyses = await db.analyses.aggregate(pipeline).to_list(length=limit)
        
        logger.info(f"Found {len(analyses)} analyses for user {user_id}")
        
        # Convert to response format
        result = []
        for analysis in analyses:
            # Handle datetime serialization
            created_at = analysis.get("created_at")
            if created_at and hasattr(created_at, 'isoformat'):
                created_at = created_at.isoformat()
            
            result.append({
                "id": str(analysis["_id"]),
                "image_url": analysis.get("image_url", ""),
                "disease": analysis.get("disease", "Unknown"),
                "confidence": analysis.get("confidence", 0),
                "created_at": created_at,
                "is_favorite": analysis.get("is_favorite", False)
            })
        
        return result
        
    except Exception as e:
        import traceback
        logger.error(f"Error fetching analysis history: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analysis/{analysis_id}")
async def get_analysis_by_id(
    analysis_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get a specific analysis by ID"""
    try:
        from app.services.database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        # Find analysis for this user
        analysis = await db.analyses.find_one({
            "_id": ObjectId(analysis_id),
            "user_id": current_user["id"]
        })
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Convert ObjectId to string
        analysis["id"] = str(analysis["_id"])
        del analysis["_id"]
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Delete an analysis"""
    try:
        from app.services.database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        result = await db.analyses.delete_one({
            "_id": ObjectId(analysis_id),
            "user_id": current_user["id"]
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {"message": "Analysis deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))