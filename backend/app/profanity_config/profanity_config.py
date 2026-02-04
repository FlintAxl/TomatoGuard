"""
Configuration file for profanity filter settings
"""

# Profanity filter configuration
PROFANITY_CONFIG = {
    # Default replacement character
    "replacement_char": "*",
    
    # Enable/disable profanity filtering
    "enabled": True,
    
    # Log filtered content (for monitoring)
    "log_filtered": True,
    
    # Custom bad words list (can be extended)
    "custom_bad_words": [
        # Add any additional words here
        # "example_bad_word",
    ],
    
    # Words to whitelist (never filter these)
    "whitelisted_words": [
        # Words that might match patterns but shouldn't be filtered
        # "class", "pass", etc. - already handled by word boundaries
    ],
    
    # Filter settings for different content types
    "content_settings": {
        "title": {
            "enabled": True,
            "replacement_char": "*",
        },
        "description": {
            "enabled": True,
            "replacement_char": "*",
        },
        "comment": {
            "enabled": True,
            "replacement_char": "*",
        }
    }
}

# Default bad words list (can be overridden by config)
DEFAULT_BAD_WORDS = [
    # English profanity
    'fuck', 'fucking', 'fucker', 'fucked',
    'shit', 'shitty', 'shitting', 'shat',
    'damn', 'dammit', 'damned',
    'bitch', 'bitching', 'bitched',
    'bastard', 'bastards',
    'asshole', 'assholes', 'ass',
    'crap', 'crappy', 'crapping',
    'dick', 'dickhead', 'dicks',
    'piss', 'pissing', 'pissed',
    'hell', 'hellish',
    'whore', 'whores', 'whoring',
    'slut', 'sluts', 'slutty',
    'cunt', 'cunts', 'cunting',
    'cock', 'cocks', 'cocky',
    'pussy', 'pussies',
    'twat', 'twats',
    'wanker', 'wankers',
    'bullshit', 'bullshitting',
    'motherfucker', 'motherfuckers',
    
    # Common variations and misspellings
    'fck', 'fcking', 'fcker',
    'sh*t', 'sh*tty',
    'b*tch', 'b*tching',
    'a$$', 'a$$hole',
    'd*ck', 'd*ckhead',
    
    # Additional terms
    'son_of_a_bitch', 'sonofabitch',
    'goddamn', 'goddammit',
    'jackass', 'jackasses',
    'dumbass', 'dumbasses',
    'shithead', 'shitheads',
    'fuckwit', 'fuckwits',
    'arsehole', 'arseholes',
    'bloody', 'bugger', 'buggery',
]
