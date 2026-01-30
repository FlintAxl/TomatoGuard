# Add this import at the top
from datetime import datetime
from typing import Optional, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.services.user_service import user_service

# OAuth2 scheme for token handling
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False  # Allow optional authentication
)

async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> Optional[Dict]:
    """
    Dependency to get current user from JWT token
    """
    from app.services.auth_service import auth_service
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify and decode token
        payload = auth_service.verify_token(token, token_type="access")
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        # Get user from database
        user = await user_service.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        # Convert UserRead model to dictionary
        return {
            "id": str(user.id) if user.id else "",
            "email": user.email if user.email else "",
            "full_name": user.full_name if user.full_name else "",
            "is_active": user.is_active if hasattr(user, 'is_active') else True,
            "created_at": user.created_at.isoformat() if user.created_at else datetime.utcnow().isoformat(),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Dependency to get current active user
    
    Args:
        current_user: Current user from get_current_user dependency
        
    Returns:
        Current user if active
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    
    return current_user