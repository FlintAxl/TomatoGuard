from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class Notification(BaseModel):
    """Notification model for MongoDB"""
    id: Optional[str] = Field(None, alias="_id")
    recipient_id: str
    type: str = "forum_post"  # forum_post, forum_comment, etc.
    message: str
    author_id: str
    author_name: str
    post_id: Optional[str] = None
    post_title: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        from_attributes = True


class NotificationResponse(BaseModel):
    """Notification response for frontend"""
    id: str
    recipient_id: str
    type: str
    message: str
    author_id: str
    author_name: str
    post_id: Optional[str] = None
    post_title: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
