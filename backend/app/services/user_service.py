from typing import Optional, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from app.schemas.user import UserCreate, UserRead
from app.models.user_model import UserInDB, UserRole
from app.services.database import get_user_collection
from app.services.auth_service import auth_service


class UserService:
    """Service for user-related database operations"""
    
    def __init__(self):
        # Don't initialize collection in __init__
        self._users_collection = None
    
    @property
    def users_collection(self):
        """Lazy-load the users collection"""
        if self._users_collection is None:
            self._users_collection = get_user_collection()
        return self._users_collection
    
    async def create_user(self, user_create: UserCreate) -> UserRead:
        """
        Create a new user
        
        Args:
            user_create: User creation data
            
        Returns:
            Created user
            
        Raises:
            HTTPException: If user already exists
        """
        # Check if user already exists
        existing_user = await self.users_collection.find_one(
            {"email": user_create.email}
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )
        
        # Hash password
        hashed_password = auth_service.get_password_hash(user_create.password)
        
        # Create user document
        user_dict = user_create.dict(exclude={"password"})
        user_dict["hashed_password"] = hashed_password
        
        # Create UserInDB instance
        user_in_db = UserInDB(**user_dict)
        
        # Insert into database
        result = await self.users_collection.insert_one(
            user_in_db.dict(by_alias=True)
        )
        
        # Get the created user
        created_user = await self.get_user_by_id(str(result.inserted_id))
        
        return created_user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserRead]:
        """
        Authenticate a user with email and password
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            User if authentication successful, None otherwise
        """
        user_doc = await self.users_collection.find_one({"email": email})
        
        if not user_doc:
            return None
        
        # Verify password
        if not auth_service.verify_password(password, user_doc["hashed_password"]):
            return None
        
        # Convert to UserRead schema
        return UserRead(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            full_name=user_doc.get("full_name"),
            profile_picture=user_doc.get("profile_picture"),
            role=user_doc.get("role", UserRole.USER),
            is_active=user_doc.get("is_active", True)
        )
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserRead]:
        """
        Get user by MongoDB ID
        
        Args:
            user_id: User's MongoDB ID string
            
        Returns:
            User if found, None otherwise
        """
        try:
            user_doc = await self.users_collection.find_one(
                {"_id": ObjectId(user_id)}
            )
        except:
            return None
        
        if not user_doc:
            return None
        
        return UserRead(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            full_name=user_doc.get("full_name"),
            profile_picture=user_doc.get("profile_picture"),
            role=user_doc.get("role", UserRole.USER),
            is_active=user_doc.get("is_active", True),
            created_at=user_doc.get("created_at")
        )
    
    async def get_user_by_email(self, email: str) -> Optional[UserRead]:
        """
        Get user by email
        
        Args:
            email: User email
            
        Returns:
            User if found, None otherwise
        """
        user_doc = await self.users_collection.find_one({"email": email})
        
        if not user_doc:
            return None
        
        return UserRead(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            full_name=user_doc.get("full_name"),
            profile_picture=user_doc.get("profile_picture"),
            role=user_doc.get("role", UserRole.USER),
            is_active=user_doc.get("is_active", True),
            created_at=user_doc.get("created_at")
        )
    
    async def update_user(
        self, 
        user_id: str, 
        update_data: Dict[str, Any]
    ) -> Optional[UserRead]:
        """
        Update user information
        
        Args:
            user_id: User's MongoDB ID
            update_data: Fields to update
            
        Returns:
            Updated user if successful, None otherwise
        """
        # Remove password field if present (use separate endpoint for password change)
        update_data.pop("password", None)
        update_data.pop("hashed_password", None)
        
        # Update user
        result = await self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await self.get_user_by_id(user_id)
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user
        
        Args:
            user_id: User's MongoDB ID
            
        Returns:
            True if deleted, False otherwise
        """
        result = await self.users_collection.delete_one(
            {"_id": ObjectId(user_id)}
        )
        
        return result.deleted_count > 0
    
    async def user_exists(self, email: str) -> bool:
        """
        Check if a user with given email exists
        
        Args:
            email: Email to check
            
        Returns:
            True if user exists, False otherwise
        """
        user_doc = await self.users_collection.find_one({"email": email})
        return user_doc is not None

    async def get_all_users(self) -> list:
        """
        Get all users (admin only)
        
        Returns:
            List of all users
        """
        users = []
        cursor = self.users_collection.find({})
        async for user_doc in cursor:
            users.append(UserRead(
                id=str(user_doc["_id"]),
                email=user_doc["email"],
                full_name=user_doc.get("full_name"),
                profile_picture=user_doc.get("profile_picture"),
                role=user_doc.get("role", UserRole.USER),
                is_active=user_doc.get("is_active", True),
                created_at=user_doc.get("created_at")
            ))
        return users

    async def update_user_role(self, user_id: str, new_role: UserRole) -> Optional[UserRead]:
        """
        Update user role (admin only)
        
        Args:
            user_id: User's MongoDB ID
            new_role: New role to assign
            
        Returns:
            Updated user if successful, None otherwise
        """
        result = await self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role}}
        )
        
        if result.modified_count == 0:
            return None
        
        return await self.get_user_by_id(user_id)

    async def update_user_status(self, user_id: str, is_active: bool) -> Optional[UserRead]:
        """
        Activate or deactivate a user (admin only)
        
        Args:
            user_id: User's MongoDB ID
            is_active: New active status
            
        Returns:
            Updated user if successful, None otherwise
        """
        result = await self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": is_active}}
        )
        
        if result.modified_count == 0:
            return None
        
        return await self.get_user_by_id(user_id)


# Create singleton instance - this will NOT initialize the database connection immediately
user_service = UserService()