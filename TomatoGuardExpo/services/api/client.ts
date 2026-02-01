import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

export const getApiClient = (token?: string): AxiosInstance => {
  let baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
  
  // For web with ngrok, use the ngrok URL from environment variable
  // Don't force localhost - that's the bug!
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const currentOrigin = window.location.origin;
    const isNgrok = currentOrigin.includes('.ngrok-free.dev') || 
                    currentOrigin.includes('.exp.direct') || 
                    currentOrigin.includes('.ngrok.io');
    
    // If we're on ngrok/expo, make sure we're using the ngrok API URL
    if (isNgrok && baseURL.includes('localhost')) {
      console.warn('⚠️ API URL is still localhost while using ngrok tunnel!');
      console.log('Current baseURL:', baseURL);
      console.log('Current origin:', currentOrigin);
      
      // Auto-detect ngrok URL from current origin if possible
      if (currentOrigin.includes('.ngrok-free.dev')) {
        baseURL = currentOrigin;
        console.log('🔄 Auto-corrected baseURL to:', baseURL);
      }
    }
  }

  console.log('🌐 API Client using baseURL:', baseURL);

  const config: AxiosRequestConfig = {
    baseURL,
    timeout: 60000,
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // Skip ngrok browser warning
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