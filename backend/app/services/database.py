from typing import Optional
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """Initialize MongoDB client and database (async)."""
    global _client, _db

    settings = get_settings()
    uri = settings.mongo_db_uri or settings.db_uri
    if not uri:
        raise ValueError("MongoDB connection string not configured (DB_URI or MONGO_DB_URI)")

    # Extract database name for logging (hide password)
    safe_uri = uri.split('@')[-1] if '@' in uri else uri
    print(f"📡 Connecting to MongoDB: {safe_uri}")
    
    try:
        _client = AsyncIOMotorClient(uri)
        
        # Test connection
        await _client.admin.command('ping')
        
        if settings.mongo_db_name:
            _db = _client[settings.mongo_db_name]
            db_name = settings.mongo_db_name
        else:
            # Extract database name from URI
            parsed = urllib.parse.urlparse(uri)
            db_name = parsed.path[1:] if parsed.path else "tomato_guard"
            _db = _client[db_name]
        
        # List collections
        collections = await _db.list_collection_names()
        
        print(f"✅ MongoDB connected successfully!")
        print(f"   Database: {db_name}")
        print(f"   Collections: {len(collections)} collections")
        if collections:
            print(f"   Available: {', '.join(collections[:3])}" + 
                  (f" and {len(collections)-3} more" if len(collections) > 3 else ""))
        else:
            print(f"   No collections yet (will be created on first use)")
        
        # Ensure users collection exists with indexes
        if "users" not in collections:
            print(f"   Note: 'users' collection will be created when first user registers")
            
        return _db
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)[:100]}...")
        raise


async def close_mongo_connection() -> None:
    """Close MongoDB client on application shutdown."""
    global _client, _db

    if _client is not None:
        _client.close()
        print("🔌 MongoDB connection closed.")

    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _db


def get_user_collection():
    """Helper to get the users collection."""
    db = get_database()
    return db["users"]