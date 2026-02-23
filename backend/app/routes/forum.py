from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
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

# In routes/forum.py, update the create_post endpoint:
@router.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(
    title: str = Form(...),
    category: str = Form("general"),
    description: str = Form(...),
    images: List[UploadFile] = File(default=[]),
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Create a new forum post with images
    """
    print(f"📸 Creating post with {len(images)} images")
    
    # Upload images to Cloudinary if provided
    image_urls = []
    for i, image in enumerate(images):
        try:
            print(f"📤 Processing image {i+1}: {image.filename}")
            file_content = await image.read()
            print(f"📊 File size: {len(file_content)} bytes")
            
            upload_result = cloudinary_service.upload_image(file_content)
            image_url = upload_result["url"] if isinstance(upload_result, dict) else upload_result
            image_urls.append(image_url)
            print(f"✅ Uploaded to Cloudinary: {image_url}")
        except Exception as e:
            print(f"❌ Upload failed for image {i+1}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to upload image {image.filename}: {str(e)}"
            )
    
    # Create post data
    post_dict = {
        "title": title,
        "category": category,
        "description": description,
        "image_urls": image_urls
    }
    
    # Create PostCreate object
    post_data = PostCreate(**post_dict)
    
    # Create post
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

@router.get("/likes")
async def get_my_likes(
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Get all posts liked by the current user
    """
    liked_posts = await forum_service.get_liked_posts_by_user(current_user["id"])
    enriched_posts = [await forum_service.enrich_post(post, current_user["id"]) for post in liked_posts]
    return enriched_posts
# ========== IMAGE ENDPOINTS ==========

@router.post("/posts/{post_id}/images")
async def upload_post_images(
    post_id: str,
    images: List[UploadFile] = File(...),
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Upload multiple images for a post
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
    
    # Upload all images to Cloudinary
    image_urls = []
    try:
        for image in images:
            file_content = await image.read()
            upload_result = cloudinary_service.upload_image(file_content)
            image_url = upload_result["url"] if isinstance(upload_result, dict) else upload_result
            image_urls.append(image_url)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upload images: {str(e)}"
        )
    
    # Update post with image URLs
    await forum_service.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"image_urls": {"$each": image_urls}}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {"image_urls": image_urls}

@router.delete("/posts/{post_id}/images/{image_index}")
async def delete_post_image(
    post_id: str,
    image_index: int,
    current_user=Depends(get_current_user),
    forum_service: ForumService = Depends(get_forum_service)
):
    """
    Delete a specific image from a post
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
    
    if image_index < 0 or image_index >= len(post.image_urls):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image index"
        )
    
    # Remove image from list
    await forum_service.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$unset": {f"image_urls.{image_index}": 1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    # Pull null values from array
    await forum_service.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"image_urls": None}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Image deleted successfully"}

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