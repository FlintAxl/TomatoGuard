from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import get_settings
from app.schemas.token import Token, TokenData
from app.utils.security import verify_password, get_password_hash

settings = get_settings()


class AuthService:
    """Service for authentication and JWT token management"""
    
    @staticmethod
    def create_access_token(
        data: Dict[str, Any], 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create a JWT access token
        
        Args:
            data: Data to encode in token (usually user_id and email)
            expires_delta: Optional custom expiration time
            
        Returns:
            JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.access_token_expire_minutes
            )
        
        to_encode.update({"exp": expire, "type": "access"})
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(
        data: Dict[str, Any],
        expires_delta: timedelta = timedelta(days=30)
    ) -> str:
        """
        Create a JWT refresh token (longer expiration)
        
        Args:
            data: Data to encode in token
            expires_delta: Expiration time (default 30 days)
            
        Returns:
            JWT refresh token string
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + expires_delta
        
        to_encode.update({"exp": expire, "type": "refresh"})
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
        """
        Verify and decode a JWT token
        
        Args:
            token: JWT token string
            token_type: Expected token type ('access' or 'refresh')
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid, expired, or wrong type
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=[settings.jwt_algorithm],
            )
            
            # Check token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token type. Expected {token_type}",
                )
            
            user_id: str = payload.get("user_id")
            email: str = payload.get("email")
            
            if user_id is None or email is None:
                raise credentials_exception
                
            return payload
            
        except JWTError:
            raise credentials_exception
    
    @staticmethod
    def create_tokens(user_id: str, email: str, role: str = "user") -> Dict[str, str]:
        """
        Create both access and refresh tokens for a user
        
        Args:
            user_id: User's MongoDB ID
            email: User's email
            role: User's role (default: "user")
            
        Returns:
            Dictionary with access_token and refresh_token
        """
        token_data = {"user_id": user_id, "email": email, "role": role}
        
        access_token = AuthService.create_access_token(data=token_data)
        refresh_token = AuthService.create_refresh_token(data=token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password"""
        return verify_password(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return get_password_hash(password)


# Create singleton instance
auth_service = AuthService()