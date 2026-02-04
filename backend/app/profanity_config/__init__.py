"""
Configuration modules for the backend application.
"""

# Import the original config.py functions for backward compatibility
from ..config import get_settings, Settings

# Import profanity filter configuration
from .profanity_config import PROFANITY_CONFIG, DEFAULT_BAD_WORDS

__all__ = ['get_settings', 'Settings', 'PROFANITY_CONFIG', 'DEFAULT_BAD_WORDS']
