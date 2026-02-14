"""
Firebase Authentication Service
Handles Firebase token verification and user management
"""
import os
import json
from typing import Dict, Any, Optional

import firebase_admin
from firebase_admin import auth, credentials

from app.config import get_settings

settings = get_settings()


class FirebaseService:
    """Service for Firebase authentication operations"""
    
    _initialized = False
    
    @classmethod
    def initialize(cls):
        """Initialize Firebase Admin SDK"""
        if cls._initialized:
            return
        
        try:
            # Try to load from service account file first
            service_account_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "firebase-service-account.json"
            )
            
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("Firebase initialized from service account file")
            else:
                # Try to load from environment variable
                firebase_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT")
                if firebase_creds:
                    cred_dict = json.loads(firebase_creds)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("Firebase initialized from environment variable")
                else:
                    raise ValueError(
                        "Firebase credentials not found. Please provide either:\n"
                        "1. A 'firebase-service-account.json' file in the backend folder\n"
                        "2. A FIREBASE_SERVICE_ACCOUNT environment variable with the JSON content"
                    )
            
            cls._initialized = True
            
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")
            raise
    
    @staticmethod
    def verify_id_token(id_token: str) -> Dict[str, Any]:
        """
        Verify a Firebase ID token
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Decoded token payload containing user info
            
        Raises:
            ValueError: If token is invalid
        """
        FirebaseService.initialize()
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except auth.InvalidIdTokenError as e:
            raise ValueError(f"Invalid Firebase token: {e}")
        except auth.ExpiredIdTokenError as e:
            raise ValueError(f"Expired Firebase token: {e}")
        except Exception as e:
            raise ValueError(f"Failed to verify Firebase token: {e}")
    
    @staticmethod
    def get_user_by_uid(uid: str) -> Optional[Dict[str, Any]]:
        """
        Get Firebase user by UID
        
        Args:
            uid: Firebase user UID
            
        Returns:
            User data dict or None
        """
        FirebaseService.initialize()
        
        try:
            user = auth.get_user(uid)
            return {
                "uid": user.uid,
                "email": user.email,
                "display_name": user.display_name,
                "photo_url": user.photo_url,
                "email_verified": user.email_verified,
                "disabled": user.disabled,
            }
        except auth.UserNotFoundError:
            return None
        except Exception as e:
            print(f"Error getting Firebase user: {e}")
            return None
    
    @staticmethod
    def delete_user(uid: str) -> bool:
        """
        Delete a Firebase user
        
        Args:
            uid: Firebase user UID
            
        Returns:
            True if deleted successfully
        """
        FirebaseService.initialize()
        
        try:
            auth.delete_user(uid)
            return True
        except Exception as e:
            print(f"Error deleting Firebase user: {e}")
            return False


# Create singleton instance
firebase_service = FirebaseService()
