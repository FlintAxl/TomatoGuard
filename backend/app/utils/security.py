from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

from app.config import get_settings

# Use a different approach for password hashing
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],  # Try pbkdf2 first, fallback to bcrypt
    deprecated="auto",
    pbkdf2_sha256__default_rounds=30000,
)
settings = get_settings()

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    try:
        # First try with pbkdf2 (no 72-byte limit)
        return pwd_context.hash(password, scheme="pbkdf2_sha256")
    except Exception:
        # Fallback to bcrypt with truncation
        if len(password.encode('utf-8')) > 72:
            # Truncate to 72 bytes
            password = password[:72]
        return pwd_context.hash(password, scheme="bcrypt")

# OAuth2 scheme (moved to dependencies/auth.py, keep for backward compatibility)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False
)