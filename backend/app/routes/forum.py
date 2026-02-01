from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.dependencies.auth import get_current_user, get_current_admin_user  
from app.models.forum_model import PostCreate
from app.services.forum_service import ForumService
from app.services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="/api/v1/forum", tags=["forum"])

# Create instances
cloudinary_service = CloudinaryService()

# Dependency for ForumService
def get_forum_service():
    return ForumService()

# ========== POST ENDPOINTS ==========

@router.get("/posts")
async def get_posts(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in posts"),
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of posts to return"),
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get all forum posts with optional filtering
    """
    posts = await forum_service.get_posts(category, skip, limit, search)
    
    # Enrich each post
    enriched_posts = []
    for post in posts:
        enriched = await forum_service.enrich_post(post, current_user["id"])
        enriched_posts.append(enriched)
    
    return enriched_posts

@router.get("/posts/{post_id}")
async def get_post(
    post_id: str,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get a single post by ID
    """
    post = await forum_service.get_post(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    enriched = await forum_service.enrich_post(post, current_user["id"])
    return enriched

@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Create a new forum post
    """
    post = await forum_service.create_post(post_data, current_user["id"])
    enriched = await forum_service.enrich_post(post, current_user["id"])
    return enriched

@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    post_data: PostCreate,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Update a post (only by author)
    """
    updated_post = await forum_service.update_post(
        post_id, 
        post_data.dict(exclude_unset=True), 
        current_user["id"]
    )
    
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    
    enriched = await forum_service.enrich_post(updated_post, current_user["id"])
    return enriched

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Delete a post (author or admin only)
    """
    success = await forum_service.delete_post(post_id, current_user["id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or not authorized"
        )
    
    return {"message": "Post deleted successfully"}

# ========== COMMENT ENDPOINTS ==========

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    comment: str = Query(..., description="Comment text"),
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Add a comment to a post
    """
    updated_post = await forum_service.add_comment(post_id, current_user["id"], comment)
    
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    enriched = await forum_service.enrich_post(updated_post, current_user["id"])
    return enriched

@router.delete("/posts/{post_id}/comments/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Delete a comment (comment author, post author, or admin only)
    """
    success = await forum_service.delete_comment(post_id, comment_id, current_user["id"])
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found or not authorized"
        )
    
    return {"message": "Comment deleted successfully"}

# ========== LIKE ENDPOINTS ==========

@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: str,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Like or unlike a post
    """
    updated_post = await forum_service.toggle_like(post_id, current_user["id"])
    
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    enriched = await forum_service.enrich_post(updated_post, current_user["id"])
    return enriched

# ========== IMAGE ENDPOINTS ==========

@router.post("/posts/{post_id}/image")
async def upload_post_image(
    post_id: str,
    image: UploadFile = File(...),
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Upload image for a post
    """
    post = await forum_service.get_post(post_id)
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post.author_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post"
        )
    
    # Upload to Cloudinary
    try:
        # Read the image file
        file_content = await image.read()
        # Upload using CloudinaryService
        upload_result = cloudinary_service.upload_image(file_content)
        image_url = upload_result["url"] if isinstance(upload_result, dict) else upload_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload image: {str(e)}"
        )
    
    # Update post with image URL
    await forum_service.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"image_url": image_url, "updated_at": datetime.utcnow()}}
    )
    
    return {"image_url": image_url}

# ========== USER ENDPOINTS ==========

@router.get("/users/{user_id}/posts")
async def get_user_posts(
    user_id: str,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get all posts by a specific user
    """
    posts = await forum_service.get_user_posts(user_id)
    
    enriched_posts = []
    for post in posts:
        enriched = await forum_service.enrich_post(post, current_user["id"])
        enriched_posts.append(enriched)
    
    return enriched_posts

@router.get("/stats")
async def get_forum_stats(
    current_user=Depends(get_current_admin_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get forum statistics (admin only)
    """
    stats = await forum_service.get_post_stats()
    return stats

# ========== CATEGORY ENDPOINTS ==========

@router.get("/categories")
async def get_categories(
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get all available post categories with counts
    """
    categories = await forum_service.posts.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(length=100)
    
    return categories