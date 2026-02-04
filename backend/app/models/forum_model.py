from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, validator
from bson import ObjectId
from app.utils.profanity_filter import filter_profanity

# ========== CORE MODELS ==========

class Comment(BaseModel):
    """Embedded comment model"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('comment', pre=True)
    def filter_comment_profanity(cls, v):
        """Filter profanity from comment text"""
        if v:
            return filter_profanity(v)
        return v

class PostBase(BaseModel):
    """Base post model"""
    title: str
    category: str = "general"
    description: str
    image_urls: List[str] = Field(default_factory=list)
    
    @validator('title', pre=True)
    def filter_title_profanity(cls, v):
        """Filter profanity from post title"""
        if v:
            return filter_profanity(v)
        return v
    
    @validator('description', pre=True)
    def filter_description_profanity(cls, v):
        """Filter profanity from post description"""
        if v:
            return filter_profanity(v)
        return v

class PostCreate(PostBase):
    """Model for creating posts"""
    pass

class Post(PostBase):
    """Complete post model with MongoDB"""
    id: str = Field(None, alias="_id")
    author_id: str
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    likes: List[str] = Field(default_factory=list)  # List of user IDs
    comments: List[Comment] = Field(default_factory=list)
    comments_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        from_attributes = True

# ========== RESPONSE MODELS ==========

class UserResponse(BaseModel):
    """User data for responses"""
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool
    role: str

class CommentResponse(BaseModel):
    """Comment response model"""
    id: str
    user_id: str
    user_name: Optional[str]
    user_email: Optional[str]
    comment: str
    created_at: datetime

class PostResponse(BaseModel):
    """Complete post response for frontend"""
    id: str
    title: str
    category: str
    description: str
    image_urls: List[str] = Field(default_factory=list)
    author_id: str
    author_name: Optional[str]
    author_email: Optional[str]
    likes: List[str]
    likes_count: int
    comments: List[CommentResponse]
    comments_count: int
    created_at: datetime
    updated_at: datetime
    user_has_liked: bool = False
    
    class Config:
        from_attributes = True