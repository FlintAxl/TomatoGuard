// src/services/api/chatbotService.ts
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: ConversationMessage[];
}

export interface ChatResponse {
  success: boolean;
  response: string;
  is_tomato_related?: boolean;
  // Legacy fields kept for compatibility — will be null with Claude backend
  intent?: string | null;
  confidence?: number | null;
  entities?: Record<string, any> | null;
}

export const sendMessage = async (
  message: string,
  sessionId: string,
  accessToken?: string,
  conversationHistory?: ConversationMessage[]
): Promise<ChatResponse> => {
  try {
    const payload: ChatRequest = {
      message,
      session_id: sessionId,
      ...(conversationHistory?.length && { conversation_history: conversationHistory }),
    };

    const response = await axios.post<ChatResponse>(
      `${API_BASE_URL}/api/chatbot/message`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        timeout: 30000, // 30s — Claude may take a moment
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Chatbot API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      throw new Error('Please log in to use TomaBot.');
    } else if (error.response?.status === 503) {
      throw new Error('TomaBot is temporarily unavailable. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Invalid message format.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }

    throw new Error('Failed to connect to TomaBot. Please check your connection and try again.');
  }
};

export const checkChatbotHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/chatbot/health`, {
      timeout: 5000,
    });
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Chatbot health check failed:', error);
    return false;
  }
};

// Keep old export name as alias so existing imports don't break immediately
export const sendMessageToWitAI = sendMessage;