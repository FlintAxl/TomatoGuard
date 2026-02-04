// src/services/witaiService.ts
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, any>;
}

export const sendMessageToWitAI = async (
  message: string,
  sessionId: string,
  accessToken?: string
): Promise<ChatResponse> => {
  try {
    const response = await axios.post<ChatResponse>(
      `${API_BASE_URL}/api/chatbot/message`,
      {
        message,
        session_id: sessionId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        timeout: 15000, // 15 second timeout
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Wit.ai API Error:', error.response?.data || error.message);

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