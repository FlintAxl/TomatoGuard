from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
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
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }

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