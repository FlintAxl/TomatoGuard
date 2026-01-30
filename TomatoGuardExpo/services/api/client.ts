import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

export const getApiClient = (token?: string): AxiosInstance => {
  let baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Handle web-specific URL adjustments
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const isNgrok = currentOrigin.includes('.ngrok-free.dev') || 
                    currentOrigin.includes('.exp.direct') || 
                    currentOrigin.includes('.ngrok.io');
    
    if (isNgrok) {
      baseURL = 'http://localhost:8000';
    }
  }

  const config: AxiosRequestConfig = {
    baseURL,
    timeout: 60000,
    headers: {
      'Accept': 'application/json',
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  return axios.create(config);
};