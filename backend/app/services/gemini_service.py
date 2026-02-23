# backend/app/services/gemini_service.py
# NOTE: This now uses Groq (not Gemini) under the hood.
# The file is kept as gemini_service.py to avoid changing imports elsewhere.
import os
import httpx
from typing import Dict, Any, Optional

SYSTEM_PROMPT = """You are TomaBot, an expert AI assistant specializing exclusively in tomato farming.

Your behavior:
1. First, determine if the user's question is related to tomatoes (growing, diseases, pests, harvesting, fertilization, soil, watering, varieties, etc.).
2. If the question is NOT about tomatoes, politely decline and remind the user you only assist with tomato-related topics. Do not answer the off-topic question.
3. If the question IS about tomatoes, provide a helpful, accurate, and detailed response.

You may help with topics such as:
- Tomato diseases and treatments (early blight, late blight, septoria leaf spot, fusarium wilt, blossom end rot, etc.)
- Growing tips and best practices
- Pest identification and organic/chemical control
- Harvesting timing and techniques
- Fertilization schedules and soil preparation
- Watering techniques and irrigation
- Tomato varieties and their characteristics
- Seedling care and transplanting

When declining off-topic questions, respond with exactly this message:
"I'm TomaBot and I can only help with tomato-related questions! 🍅 Please ask me anything about growing, caring for, or troubleshooting your tomato plants."

Keep responses clear, practical, and friendly. Use emojis sparingly to make responses visually scannable."""


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = "llama-3.1-8b-instant"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

    def _build_payload(self, message: str, conversation_history: Optional[list]) -> Dict:
        """
        Build the Groq API request payload.
        Groq uses OpenAI-compatible format with a 'messages' array.
        System prompt goes as the first message with role 'system'.
        """
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Add prior conversation turns if any
        if conversation_history:
            for turn in conversation_history:
                messages.append({
                    "role": turn["role"],  # already 'user' or 'assistant'
                    "content": turn["content"],
                })

        # Add the current user message
        messages.append({"role": "user", "content": message})

        return {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
        }

    async def send_message(
        self,
        message: str,
        conversation_history: Optional[list] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Send a user message to Groq and get a response.

        Args:
            message: The user's message
            conversation_history: Optional list of prior messages for multi-turn context
                                  Each item: {"role": "user"|"assistant", "content": "..."}
            session_id: Optional session ID (kept for API compatibility)

        Returns:
            Dict with success, response, and is_tomato_related flag
        """
        payload = self._build_payload(message, conversation_history)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self._get_headers(),
                    json=payload,
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()

                # Extract text from OpenAI-compatible response structure
                bot_response = data["choices"][0]["message"]["content"]

                # Detect if response is an off-topic rejection
                is_tomato_related = "I'm TomaBot and I can only help" not in bot_response

                return {
                    "success": True,
                    "response": bot_response,
                    "is_tomato_related": is_tomato_related,
                    "model": self.model,
                }

        except httpx.HTTPStatusError as e:
            error_detail = e.response.text
            print(f"Groq API HTTP Error: {e.response.status_code} - {error_detail}")

            if e.response.status_code == 429:
                return {
                    "success": False,
                    "response": "TomaBot is currently busy. Please wait a moment and try again.",
                    "error": "Rate limit exceeded",
                }

            return {
                "success": False,
                "response": "I'm having trouble right now. Please try again in a moment.",
                "error": f"HTTP {e.response.status_code}",
            }
        except httpx.RequestError as e:
            print(f"Groq API Request Error: {str(e)}")
            return {
                "success": False,
                "response": "I'm having trouble connecting. Please check your connection and try again.",
                "error": str(e),
            }
        except (KeyError, IndexError) as e:
            print(f"Groq API Response Parse Error: {str(e)}")
            return {
                "success": False,
                "response": "I received an unexpected response. Please try again.",
                "error": str(e),
            }
        except Exception as e:
            print(f"Groq API Unexpected Error: {str(e)}")
            return {
                "success": False,
                "response": "Something went wrong. Please try again.",
                "error": str(e),
            }


# Singleton instance
gemini_service = GeminiService()