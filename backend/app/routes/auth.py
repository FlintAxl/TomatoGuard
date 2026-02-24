from datetime import datetime
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.schemas.user import UserCreate, UserLogin, UserRead
from app.schemas.token import TokenResponse, TokenRefresh
from app.services.user_service import user_service
from app.services.auth_service import auth_service
from app.dependencies.auth import get_current_user, get_current_active_user

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# In-memory blacklist for refresh tokens (in production, use Redis or database)
refresh_token_blacklist = set()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_create: UserCreate):
    """
    Register a new user
    
    Args:
        user_create: User registration data
        
    Returns:
        Created user
        
    Raises:
        HTTPException: If user already exists
    """
    try:
        user = await user_service.create_user(user_create)
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/login")
async def login(login_data: UserLogin):
    """
    Authenticate user and return JWT tokens with user info
    """
    # Authenticate user
    user = await user_service.authenticate_user(login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    # Check if user is active
    if not user.is_active:
        detail_msg = "Your account has been deactivated."
        if user.deactivation_reason:
            detail_msg += f" Reason: {user.deactivation_reason}"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail_msg,
        )
    
    # Create tokens
    tokens = auth_service.create_tokens(str(user.id), user.email, user.role)
    
    # Add expiration time (in seconds)
    from app.config import get_settings
    settings = get_settings()
    expires_in = settings.access_token_expire_minutes * 60
    
    # Return everything including user info
    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": tokens["token_type"],
        "expires_in": expires_in,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "deactivation_reason": user.deactivation_reason,
        }
    }


# Firebase Authentication Schema
class FirebaseLoginRequest(BaseModel):
    firebase_token: str
    full_name: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    is_active: bool
    reason: Optional[str] = None


@router.post("/firebase-login")
async def firebase_login(request: FirebaseLoginRequest):
    """
    Authenticate user with Firebase token.
    Creates user in database if not exists, or links existing user.
    
    Args:
        request: Contains firebase_token from client
        
    Returns:
        JWT tokens and user info (same format as regular login)
    """
    from app.services.firebase_service import firebase_service
    from app.config import get_settings
    
    try:
        # Verify Firebase token
        decoded_token = firebase_service.verify_id_token(request.firebase_token)
        
        firebase_uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name") or request.full_name
        picture = decoded_token.get("picture")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided in Firebase token"
            )
        
        # Get or create user in our database
        user = await user_service.get_or_create_firebase_user(
            firebase_uid=firebase_uid,
            email=email,
            full_name=name,
            profile_picture=picture
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create or retrieve user"
            )
        
        # Check if user is active
        if not user.is_active:
            detail_msg = "Your account has been deactivated."
            if user.deactivation_reason:
                detail_msg += f" Reason: {user.deactivation_reason}"
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=detail_msg,
            )
        
        # Create our own JWT tokens (same as regular login)
        tokens = auth_service.create_tokens(str(user.id), user.email, user.role)
        
        settings = get_settings()
        expires_in = settings.access_token_expire_minutes * 60
        
        # Return same format as regular login
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "expires_in": expires_in,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "profile_picture": user.profile_picture,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "deactivation_reason": user.deactivation_reason,
            }
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firebase authentication failed: {str(e)}"
        )


@router.get("/me")
async def get_current_user_info(
    current_user: Dict = Depends(get_current_active_user)
):
    """
    Get current authenticated user info
    
    Args:
        current_user: Current authenticated user (from dependency)
        
    Returns:
        Current user information
    """
    # Remove response_model=UserRead since we're returning a dict
    # Just return the dictionary directly
    return current_user


@router.put("/me")
async def update_profile(
    current_user: Dict = Depends(get_current_active_user),
    full_name: str = None,
    email: str = None,
    profile_picture: str = None,
):
    """
    Update current user's profile
    """
    from app.schemas.user import UserUpdate
    
    update_data = {}
    if full_name is not None:
        update_data["full_name"] = full_name
    if email is not None:
        # Check if email is already taken by another user
        existing = await user_service.get_user_by_email(email)
        if existing and str(existing.id) != current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another account"
            )
        update_data["email"] = email
    if profile_picture is not None:
        update_data["profile_picture"] = profile_picture
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updated_user = await user_service.update_user(current_user.get("id"), update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "full_name": updated_user.full_name,
        "profile_picture": updated_user.profile_picture,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at.isoformat() if updated_user.created_at else None,
        "deactivation_reason": updated_user.deactivation_reason,
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: TokenRefresh):
    """
    Refresh access token using refresh token
    
    Args:
        refresh_data: Refresh token data
        
    Returns:
        New access and refresh tokens
        
    Raises:
        HTTPException: If refresh token is invalid or blacklisted
    """
    refresh_token = refresh_data.refresh_token
    
    # Check if token is blacklisted
    if refresh_token in refresh_token_blacklist:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid",
        )
    
    try:
        # Verify refresh token
        payload = auth_service.verify_token(refresh_token, token_type="refresh")
        user_id = payload.get("user_id")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        
        # Get user to check if still active
        user = await user_service.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        
        # Create new tokens
        tokens = auth_service.create_tokens(user_id, email, user.role)
        
        # Blacklist the old refresh token (optional)
        refresh_token_blacklist.add(refresh_token)
        
        # Add expiration time
        from app.config import get_settings
        settings = get_settings()
        expires_in = settings.access_token_expire_minutes * 60
        
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            expires_in=expires_in,
        )
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

@router.post("/logout")
async def logout(
    token_refresh: TokenRefresh = None,
    current_user: Dict = Depends(get_current_user)
):
    """
    Logout user by blacklisting refresh token (optional)
    
    Args:
        token_refresh: Refresh token to blacklist (optional)
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    if token_refresh and token_refresh.refresh_token:
        refresh_token_blacklist.add(token_refresh.refresh_token)
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Successfully logged out"}
    )

@router.post("/logout-all")
async def logout_all(current_user: Dict = Depends(get_current_active_user)):
    """
    Logout user from all devices (by user ID)
    Note: In production, you'd want to track refresh tokens per user
    
    Returns:
        Success message
    """
    # In a production system, you would:
    # 1. Store refresh tokens in a database with user_id
    # 2. Invalidate all refresh tokens for this user_id
    # 3. Or use a Redis blacklist with expiration
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Logged out from all devices",
            "note": "In production, this would invalidate all refresh tokens"
        }
    )


# ---- Admin-only endpoints ----

@router.get("/users")
async def get_all_users(current_user: Dict = Depends(get_current_active_user)):
    """
    Get all users (admin only)
    
    Returns:
        List of all users
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    users = await user_service.get_all_users()
    return [
        {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "profile_picture": user.profile_picture,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "deactivation_reason": user.deactivation_reason,
        }
        for user in users
    ]


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: Dict = Depends(get_current_active_user)
):
    """
    Update a user's role (admin only)
    
    Args:
        user_id: Target user's ID
        role: New role ("user" or "admin")
    
    Returns:
        Updated user information
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Validate role
    from app.models.user_model import UserRole
    try:
        new_role = UserRole(role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'user' or 'admin'"
        )
    
    # Prevent admin from changing their own role
    if current_user.get("id") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    updated_user = await user_service.update_user_role(user_id, new_role)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "full_name": updated_user.full_name,
        "profile_picture": updated_user.profile_picture,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at.isoformat() if updated_user.created_at else None,
        "deactivation_reason": updated_user.deactivation_reason,
    }


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    request: UpdateStatusRequest,
    current_user: Dict = Depends(get_current_active_user)
):
    """
    Activate or deactivate a user (admin only)
    
    Args:
        user_id: Target user's ID
        request: Contains is_active and optional reason
    
    Returns:
        Updated user information
    """
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Prevent admin from deactivating themselves
    if current_user.get("id") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )
    
    # Require reason when deactivating
    if not request.is_active and not request.reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reason is required when deactivating a user"
        )
    
    updated_user = await user_service.update_user_status(
        user_id, request.is_active, reason=request.reason
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "full_name": updated_user.full_name,
        "profile_picture": updated_user.profile_picture,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at.isoformat() if updated_user.created_at else None,
        "deactivation_reason": updated_user.deactivation_reason,
    }