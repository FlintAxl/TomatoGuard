import re
from typing import List, Dict, Pattern
import logging
from app.profanity_config.profanity_config import PROFANITY_CONFIG, DEFAULT_BAD_WORDS

logger = logging.getLogger(__name__)

class ProfanityFilter:
    """
    Advanced profanity filter using regex patterns for word boundary detection
    and case-insensitive matching.
    """
    
    def __init__(self):
        # Check if profanity filtering is enabled
        if not PROFANITY_CONFIG.get("enabled", True):
            self.bad_words = []
            self.profanity_regex = None
            logger.info("Profanity filter is disabled")
            return
        
        # Combine default bad words with custom ones
        self.bad_words = DEFAULT_BAD_WORDS.copy()
        custom_words = PROFANITY_CONFIG.get("custom_bad_words", [])
        self.bad_words.extend(custom_words)
        
        # Remove whitelisted words
        whitelisted = PROFANITY_CONFIG.get("whitelisted_words", [])
        for word in whitelisted:
            self.bad_words = [w for w in self.bad_words if w.lower() != word.lower()]
        
        # Compile regex patterns for performance
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile regex patterns for better performance"""
        # Create word boundary patterns for each bad word
        patterns = []
        
        for word in self.bad_words:
            # Escape special regex characters in the word
            escaped_word = re.escape(word)
            # Create pattern with word boundaries
            pattern = r'\b' + escaped_word + r'\b'
            patterns.append(pattern)
        
        # Combine all patterns into one regex (case-insensitive)
        if patterns:
            combined_pattern = '|'.join(patterns)
            self.profanity_regex: Pattern = re.compile(
                combined_pattern, 
                re.IGNORECASE | re.UNICODE
            )
        else:
            self.profanity_regex = None
        
        logger.info(f"Compiled profanity filter with {len(self.bad_words)} words")
    
    def filter_text(self, text: str, replacement: str = "*") -> str:
        """
        Filter profanity from text by replacing with specified character.
        
        Args:
            text: The text to filter
            replacement: Character to replace profanity with (default: "*")
            
        Returns:
            Filtered text with profanity replaced
        """
        if not text or not self.profanity_regex:
            return text
        
        def replace_match(match):
            """Replace matched profanity with same length of replacement chars"""
            profane_word = match.group()
            return replacement * len(profane_word)
        
        # Apply the regex replacement
        filtered_text = self.profanity_regex.sub(replace_match, text)
        
        # Log if filtering occurred
        if filtered_text != text:
            logger.info(f"Filtered profanity in text: {text[:50]}...")
        
        return filtered_text
    
    def contains_profanity(self, text: str) -> bool:
        """
        Check if text contains profanity.
        
        Args:
            text: The text to check
            
        Returns:
            True if profanity is found, False otherwise
        """
        if not text or not self.profanity_regex:
            return False
        
        return bool(self.profanity_regex.search(text))
    
    def get_profanity_count(self, text: str) -> int:
        """
        Count instances of profanity in text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Number of profanity instances found
        """
        if not text or not self.profanity_regex:
            return 0
        
        return len(self.profanity_regex.findall(text))
    
    def add_bad_words(self, words: List[str]):
        """
        Add new bad words to the filter.
        
        Args:
            words: List of new bad words to add
        """
        for word in words:
            if word.lower() not in [w.lower() for w in self.bad_words]:
                self.bad_words.append(word.lower())
        
        # Recompile patterns with new words
        self._compile_patterns()
        logger.info(f"Added {len(words)} new bad words to filter")
    
    def remove_bad_words(self, words: List[str]):
        """
        Remove words from the bad words list.
        
        Args:
            words: List of words to remove
        """
        for word in words:
            self.bad_words = [w for w in self.bad_words if w.lower() != word.lower()]
        
        # Recompile patterns
        self._compile_patterns()
        logger.info(f"Removed {len(words)} words from filter")
    
    def get_bad_words_count(self) -> int:
        """Get the current count of bad words in the filter."""
        return len(self.bad_words)

# Create a global instance for reuse
profanity_filter = ProfanityFilter()

# Convenience functions for direct usage
def filter_profanity(text: str, replacement: str = "*") -> str:
    """Filter profanity from text using the global filter instance."""
    return profanity_filter.filter_text(text, replacement)

def has_profanity(text: str) -> bool:
    """Check if text contains profanity using the global filter instance."""
    return profanity_filter.contains_profanity(text)

def count_profanity(text: str) -> int:
    """Count profanity instances in text using the global filter instance."""
    return profanity_filter.get_profanity_count(text)
