from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from bson import ObjectId
from app.utils.profanity_filter import filter_profanity

# ========== CORE ANALYSIS MODELS ==========

class AnalysisMetadata(BaseModel):
    """Metadata for analysis records"""
    processing_time: Optional[float] = None
    model_version: Optional[str] = None
    preprocessing_method: Optional[str] = None
    bounding_boxes_enabled: Optional[bool] = None
    total_processing_time: Optional[str] = None

class DiseaseDetection(BaseModel):
    """Disease detection results"""
    disease: str
    confidence: float
    alternative_predictions: Optional[List[Dict[str, Any]]] = None
    tta_used: Optional[bool] = None

class PartDetection(BaseModel):
    """Plant part detection results"""
    part: str
    confidence: float
    alternative_parts: Optional[List[Dict[str, Any]]] = None

class SpotDetection(BaseModel):
    """Disease spot detection results"""
    status: Optional[str] = None
    message: Optional[str] = None
    disease_name: Optional[str] = None
    total_spots: Optional[int] = None
    total_area: Optional[int] = None
    original_image: Optional[str] = None  # Base64 image
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    severity: Optional[Dict[str, Any]] = None
    analysis_info: Optional[Dict[str, Any]] = None

class Recommendations(BaseModel):
    """Treatment recommendations"""
    disease: Optional[str] = None
    plant_part: Optional[str] = None
    description: Optional[str] = None
    immediate_actions: Optional[List[str]] = None
    preventive_measures: Optional[List[str]] = None
    chemical_treatments: Optional[List[Dict[str, Any]]] = None
    organic_treatments: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    fallback_advice: Optional[List[str]] = None

class ImageInfo(BaseModel):
    """Image processing information"""
    original_size: Optional[List[int]] = None
    processed_size: Optional[List[int]] = None
    format: Optional[str] = None
    preprocessing_time: Optional[str] = None
    inference_time: Optional[str] = None
    spot_detection_time: Optional[str] = None
    enhanced_preprocessing: Optional[bool] = None

class ModelInfo(BaseModel):
    """Model information"""
    loaded_models: Optional[List[str]] = None
    total_models: Optional[int] = None
    analysis_timestamp: Optional[str] = None
    preprocessing_method: Optional[str] = None
    bounding_boxes_enabled: Optional[bool] = None

class Performance(BaseModel):
    """Performance metrics"""
    preprocessing_time: Optional[str] = None
    model_inference_time: Optional[str] = None
    spot_detection_time: Optional[str] = None
    total_processing_time: Optional[str] = None

# ========== MAIN ANALYSIS RECORD ==========

class AnalysisRecord(BaseModel):
    """Complete analysis record for database storage"""
    user_id: str
    image_url: str
    cloudinary_public_id: str
    analysis_result: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_favorite: bool = False
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Optional[AnalysisMetadata] = None
    
    @validator('notes', pre=True)
    def filter_notes_profanity(cls, v):
        """Filter profanity from user notes"""
        if v:
            return filter_profanity(v)
        return v
    
    @validator('tags', pre=True)
    def filter_tags_profanity(cls, v):
        """Filter profanity from tags"""
        if v and isinstance(v, list):
            return [filter_profanity(tag) for tag in v]
        return v or []
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        from_attributes = True

class AnalysisCreate(BaseModel):
    """Model for creating analysis records"""
    user_id: str
    image_url: str
    cloudinary_public_id: str
    analysis_result: Dict[str, Any]
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Optional[AnalysisMetadata] = None
    
    @validator('notes', pre=True)
    def filter_notes_profanity(cls, v):
        """Filter profanity from user notes"""
        if v:
            return filter_profanity(v)
        return v
    
    @validator('tags', pre=True)
    def filter_tags_profanity(cls, v):
        """Filter profanity from tags"""
        if v and isinstance(v, list):
            return [filter_profanity(tag) for tag in v]
        return v or []

# ========== RESPONSE MODELS ==========

class AnalysisResponse(BaseModel):
    """Analysis record response for frontend"""
    id: str
    user_id: str
    image_url: str
    cloudinary_public_id: str
    analysis_result: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    is_favorite: bool
    notes: Optional[str] = None
    tags: List[str] = []
    metadata: Optional[AnalysisMetadata] = None
    
    class Config:
        from_attributes = True

class UserAnalysisStats(BaseModel):
    """User-specific analysis statistics"""
    total_analyses: int
    disease_frequency: Dict[str, int]
    healthy_vs_diseased_ratio: float
    most_common_diseases: List[Dict[str, Any]]
    analyses_by_month: List[Dict[str, Any]]
    favorite_analyses_count: int
    average_processing_time: Optional[float] = None
    most_analyzed_plant_parts: List[Dict[str, Any]]
    severity_distribution: Dict[str, int]

class AnalysisSearchFilters(BaseModel):
    """Search and filter parameters for analyses"""
    disease: Optional[str] = None
    plant_part: Optional[str] = None
    severity: Optional[str] = None
    is_favorite: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    tags: Optional[List[str]] = None
    has_disease: Optional[bool] = None
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

class AnalysisSummary(BaseModel):
    """Brief summary of analysis for list views"""
    id: str
    image_url: str
    disease: Optional[str] = None
    confidence: Optional[float] = None
    plant_part: Optional[str] = None
    severity: Optional[str] = None
    created_at: datetime
    is_favorite: bool
    notes: Optional[str] = None
    tags: List[str] = []
    
    class Config:
        from_attributes = True
