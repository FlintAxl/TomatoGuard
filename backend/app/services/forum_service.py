from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.forum_model import Post, PostCreate, Comment, PostResponse
from app.services.database import get_database

class ForumService:
    def __init__(self):
        self.db = get_database()
        self.posts = self.db.posts
        self.users = self.db.users
    
    
    # ========== POST OPERATIONS ==========
        
    async def create_post(self, post_data: PostCreate, user_id: str) -> Post:
        """Create a new forum post"""
        # Get user info - handle both string and ObjectId formats
        try:
            if isinstance(user_id, str):
                user = await self.users.find_one({"_id": ObjectId(user_id)})
            else:
                user = await self.users.find_one({"_id": user_id})
        except:
            user = None
        
        # Debug logging
        print(f"Creating post for user_id: {user_id}")
        print(f"Found user: {user}")
        
        post = Post(
            **post_data.dict(),
            author_id=user_id,
            author_name=user.get("full_name", "Anonymous") if user else "Anonymous",
            author_email=user.get("email", "") if user else "",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        print(f"Post to save: {post.dict(exclude={'id'})}")
        result = await self.posts.insert_one(post.dict(exclude={"id"}))
        post.id = str(result.inserted_id)
        print(f"Post saved with ID: {post.id}")
        return post
    
    async def get_posts(self, 
                       category: Optional[str] = None,
                       skip: int = 0, 
                       limit: int = 50,
                       search_query: Optional[str] = None) -> List[Post]:
        """Get posts with filters"""
        query = {}
        
        if category and category != "all":
            query["category"] = category
        
        if search_query:
            query["$or"] = [
                {"title": {"$regex": search_query, "$options": "i"}},
                {"description": {"$regex": search_query, "$options": "i"}},
                {"author_name": {"$regex": search_query, "$options": "i"}}
            ]
        
        # Debug logging
        print(f"🔍 Fetching posts with query: {query}")
        print(f"Database connection: {self.db}")
        print(f"Posts collection: {self.posts}")
        
        cursor = self.posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
        posts_data = await cursor.to_list(length=limit)
        
        print(f"📊 Found {len(posts_data)} posts in database")
        for i, post in enumerate(posts_data):
            print(f"  Post {i+1}: {post.get('title')} by {post.get('author_name')} (ID: {post.get('_id')})")
        
        # Convert MongoDB documents to Post models
        posts = []
        for post_data in posts_data:
            # Convert ObjectId to string for the id field
            if '_id' in post_data:
                post_data['_id'] = str(post_data['_id'])
            try:
                posts.append(Post(**post_data))
            except Exception as e:
                print(f"Error converting post to model: {e}")
                print(f"Post data: {post_data}")
                continue
        
        return posts
    
    async def get_post(self, post_id: str) -> Optional[Post]:
        """Get single post by ID"""
        try:
            post = await self.posts.find_one({"_id": ObjectId(post_id)})
            if post:
                # Convert ObjectId to string for the id field
                if '_id' in post:
                    post['_id'] = str(post['_id'])
                return Post(**post)
        except:
            pass
        return None
    
    async def update_post(self, post_id: str, post_data: Dict[str, Any], user_id: str) -> Optional[Post]:
        """Update a post (only by author)"""
        post = await self.get_post(post_id)
        if not post or post.author_id != user_id:
            return None
        
        update_data = {k: v for k, v in post_data.items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        
        return await self.get_post(post_id)
    
    async def delete_post(self, post_id: str, user_id: str) -> bool:
        """Delete post (author or admin only)"""
        post = await self.get_post(post_id)
        if not post:
            return False
        
        user = await self.users.find_one({"_id": ObjectId(user_id)})
        is_admin = user.get("role") == "admin" if user else False
        
        if post.author_id != user_id and not is_admin:
            return False
        
        result = await self.posts.delete_one({"_id": ObjectId(post_id)})
        return result.deleted_count > 0
    
    
    # ========== COMMENT OPERATIONS ==========
    
    async def add_comment(self, post_id: str, user_id: str, comment_text: str) -> Optional[Post]:
        """Add comment to a post"""
        # Get user info - handle both string and ObjectId formats
        try:
            if isinstance(user_id, str):
                user = await self.users.find_one({"_id": ObjectId(user_id)})
            else:
                user = await self.users.find_one({"_id": user_id})
        except:
            user = None
        
        # Debug logging
        print(f"Adding comment for user_id: {user_id}")
        print(f"Found user: {user}")
        
        comment = Comment(
            user_id=user_id,
            user_name=user.get("full_name", "Anonymous") if user else "Anonymous",
            user_email=user.get("email", "") if user else "",
            comment=comment_text
        )
        
        result = await self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$push": {"comments": comment.dict()},
                "$inc": {"comments_count": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count:
            return await self.get_post(post_id)
        return None
    
    async def delete_comment(self, post_id: str, comment_id: str, user_id: str) -> bool:
        """Delete a comment"""
        post = await self.get_post(post_id)
        if not post:
            return False
        
        # Check if comment exists
        comment_exists = any(comment.id == comment_id for comment in post.comments)
        if not comment_exists:
            return False
        
        # Check permissions
        user = await self.users.find_one({"_id": ObjectId(user_id)})
        is_admin = user.get("role") == "admin" if user else False
        
        comment_author = None
        for comment in post.comments:
            if comment.id == comment_id:
                comment_author = comment.user_id
                break
        
        can_delete = (comment_author == user_id or 
                     post.author_id == user_id or 
                     is_admin)
        
        if not can_delete:
            return False
        
        result = await self.posts.update_one(
            {"_id": ObjectId(post_id)},
            {
                "$pull": {"comments": {"id": comment_id}},
                "$inc": {"comments_count": -1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return result.modified_count > 0
    
    # ========== LIKE OPERATIONS ==========
    
    async def toggle_like(self, post_id: str, user_id: str) -> Optional[Post]:
        """Like or unlike a post"""
        post = await self.get_post(post_id)
        if not post:
            return None
        
        if user_id in post.likes:
            # Unlike
            await self.posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$pull": {"likes": user_id}}
            )
        else:
            # Like
            await self.posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$addToSet": {"likes": user_id}}
            )
        
        return await self.get_post(post_id)
    
    # ========== DATA ENRICHMENT ==========
    
    async def enrich_post(self, post: Post, current_user_id: Optional[str] = None) -> Dict[str, Any]:
        """Enrich post data for frontend response"""
        return {
            "id": post.id,
            "title": post.title,
            "category": post.category,
            "description": post.description,
            "image_urls": post.image_urls,
            "author_id": post.author_id,
            "author_name": post.author_name,
            "author_email": post.author_email,
            "likes": post.likes,
            "likes_count": len(post.likes),
            "comments": [
                {
                    "id": comment.id,
                    "user_id": comment.user_id,
                    "user_name": comment.user_name,
                    "user_email": comment.user_email,
                    "comment": comment.comment,
                    "created_at": comment.created_at
                }
                for comment in post.comments
            ],
            "comments_count": post.comments_count,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "user_has_liked": current_user_id in post.likes if current_user_id else False
        }
    
    async def get_user_posts(self, user_id: str) -> List[Post]:
        """Get all posts by a specific user"""
        cursor = self.posts.find({"author_id": user_id}).sort("created_at", -1)
        posts_data = await cursor.to_list(length=100)
        
        # Convert MongoDB documents to Post models
        posts = []
        for post_data in posts_data:
            # Convert ObjectId to string for the id field
            if '_id' in post_data:
                post_data['_id'] = str(post_data['_id'])
            try:
                posts.append(Post(**post_data))
            except Exception as e:
                print(f"Error converting post to model: {e}")
                continue
        
        return posts
    
    async def get_liked_posts_by_user(self, user_id: str) -> List[Post]:
        """Get all posts liked by a specific user"""
        cursor = self.posts.find({"likes": user_id}).sort("created_at", -1)
        posts_data = await cursor.to_list(length=100)

        posts = []
        for post_data in posts_data:
            if '_id' in post_data:
                post_data['_id'] = str(post_data['_id'])
            try:
                posts.append(Post(**post_data))
            except Exception as e:
                print(f"Error converting post to model: {e}")
                continue

        return posts
    
    async def get_post_stats(self) -> Dict[str, int]:
        """Get forum statistics"""
        total_posts = await self.posts.count_documents({})
        total_comments = await self.posts.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$comments_count"}}}
        ]).to_list(length=1)
        
        return {
            "total_posts": total_posts,
            "total_comments": total_comments[0]["total"] if total_comments else 0,
            "total_likes": 0  # Would need aggregation for accurate count
        }