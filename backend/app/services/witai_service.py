# backend/app/services/witai_service.py
import os
import httpx
from typing import Dict, Any, Optional

class WitAIService:
    def __init__(self):
        self.access_token = os.getenv('WIT_AI_ACCESS_TOKEN')
        self.api_version = os.getenv('WIT_AI_API_VERSION', '20231201')
        self.base_url = 'https://api.wit.ai'
        
        if not self.access_token:
            raise ValueError("WIT_AI_ACCESS_TOKEN not found in environment variables")
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Wit.ai API requests"""
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    async def send_message(self, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send message to Wit.ai and get response with intent detection
        
        Args:
            message: User's message text
            session_id: Optional session identifier for context
            
        Returns:
            Dict containing bot response, intent, and metadata
        """
        try:
            async with httpx.AsyncClient() as client:
                # Call Wit.ai message endpoint
                response = await client.get(
                    f"{self.base_url}/message",
                    params={
                        'v': self.api_version,
                        'q': message
                    },
                    headers=self._get_headers(),
                    timeout=10.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract intent with highest confidence
                intent_name = 'unknown'
                confidence = 0.0
                
                if data.get('intents') and len(data['intents']) > 0:
                    top_intent = data['intents'][0]
                    intent_name = top_intent.get('name', 'unknown')
                    confidence = top_intent.get('confidence', 0.0)
                
                # Extract entities if any
                entities = data.get('entities', {})
                
                # Generate response based on intent
                bot_response = self._generate_response(intent_name, confidence, entities, message)
                
                return {
                    "success": True,
                    "response": bot_response,
                    "intent": intent_name,
                    "confidence": confidence,
                    "entities": entities,
                    "raw_text": data.get('text', message)
                }
                
        except httpx.HTTPStatusError as e:
            print(f"Wit.ai HTTP Error: {e.response.status_code} - {e.response.text}")
            return {
                "success": False,
                "response": "I'm having trouble understanding right now. Please try rephrasing your question.",
                "error": f"HTTP {e.response.status_code}"
            }
        except httpx.RequestError as e:
            print(f"Wit.ai Request Error: {str(e)}")
            return {
                "success": False,
                "response": "I'm having trouble connecting. Please try again in a moment.",
                "error": str(e)
            }
        except Exception as e:
            print(f"Wit.ai Unexpected Error: {str(e)}")
            return {
                "success": False,
                "response": "Something went wrong. Please try again.",
                "error": str(e)
            }
    
    def _generate_response(
        self, 
        intent: str, 
        confidence: float, 
        entities: Dict, 
        original_message: str
    ) -> str:
        """
        Generate appropriate response based on detected intent
        
        Args:
            intent: Detected intent name
            confidence: Confidence score (0-1)
            entities: Extracted entities
            original_message: User's original message
            
        Returns:
            Appropriate response string
        """
        # If confidence is too low, ask for clarification
        if confidence < 0.5:
            return "I'm not quite sure what you're asking. Could you rephrase your question about tomato farming?"
        
        # Response templates for each intent
        responses = {
            'greeting': (
                "Hello! I'm TomaBot, your tomato farming assistant. "
                "I can help you with:\n"
                "• Tomato diseases and treatments\n"
                "• Growing tips and best practices\n"
                "• Pest control solutions\n"
                "• Harvesting advice\n"
                "• Fertilization guidance\n\n"
                "What would you like to know about tomatoes?"
            ),
            
            'tomato_disease': (
                "I can help you with tomato diseases! Common diseases include:\n\n"
                "🔴 **Early Blight** - Brown spots with concentric rings on older leaves\n"
                "🔴 **Late Blight** - Gray-green water-soaked spots that turn brown\n"
                "🔴 **Septoria Leaf Spot** - Small circular spots with dark borders\n"
                "🔴 **Fusarium Wilt** - Yellowing and wilting of lower leaves\n"
                "🔴 **Blossom End Rot** - Dark, sunken spots on fruit bottom\n\n"
                "Which disease are you dealing with, or would you like prevention tips?"
            ),
            
            'growing_tips': (
                "Here are essential tomato growing tips:\n\n"
                "☀️ **Sunlight**: 6-8 hours of direct sun daily\n"
                "💧 **Watering**: Deep watering 1-2 times per week\n"
                "🌱 **Soil**: Well-draining, pH 6.0-6.8, rich in organic matter\n"
                "🌡️ **Temperature**: Best growth at 70-85°F (21-29°C)\n"
                "📏 **Spacing**: 24-36 inches between plants\n\n"
                "Need specific advice on any of these topics?"
            ),
            
            'pest_control': (
                "Common tomato pests and organic solutions:\n\n"
                "🐛 **Hornworms** - Hand-pick or use Bt spray\n"
                "🦟 **Aphids** - Spray with water or neem oil\n"
                "🦋 **Whiteflies** - Yellow sticky traps and neem oil\n"
                "🐌 **Slugs** - Beer traps or diatomaceous earth\n"
                "🪲 **Flea Beetles** - Row covers and neem oil\n\n"
                "Which pest are you dealing with?"
            ),
            
            'harvesting': (
                "Tomato harvesting guide:\n\n"
                "🍅 **When to harvest**: When fully colored and slightly soft to touch\n"
                "✂️ **How to pick**: Twist gently or use scissors\n"
                "📦 **Storage**: Room temperature until ripe, then refrigerate if needed\n"
                "🌡️ **Ripening**: Place green tomatoes in paper bag with apple\n"
                "⏰ **Timing**: Check plants every 2-3 days during peak season\n\n"
                "Need help with a specific harvesting issue?"
            ),
            
            'fertilization': (
                "Tomato fertilization tips:\n\n"
                "🌿 **NPK Ratio**: Use 5-10-10 or 10-10-10 fertilizer\n"
                "📅 **Timing**: Fertilize at planting, then every 2-3 weeks\n"
                "🥬 **Organic options**: Compost, fish emulsion, bone meal\n"
                "⚠️ **Avoid**: Too much nitrogen (causes leafy growth, fewer fruits)\n"
                "💧 **Method**: Side-dress or water-soluble application\n\n"
                "What stage of growth are your tomatoes in?"
            ),
            
            'off_topic': (
                "I'm TomaBot, and I specialize only in tomato-related topics! 🍅\n\n"
                "I can help you with:\n"
                "• Tomato diseases and treatments\n"
                "• Growing and cultivation tips\n"
                "• Pest control for tomatoes\n"
                "• Harvesting advice\n"
                "• Soil and fertilization\n\n"
                "Please ask me anything about growing, caring for, or treating tomato plants!"
            ),
            
            'unknown': (
                "I'm not sure I understood your question about tomatoes. "
                "Could you try asking in a different way? I'm here to help with:\n"
                "• Tomato diseases\n"
                "• Growing tips\n"
                "• Pest problems\n"
                "• Harvesting\n"
                "• Fertilization"
            )
        }
        
        return responses.get(intent, responses['unknown'])

# Singleton instance
witai_service = WitAIService()