import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { analyzeImage } from '../services/api/analyzeService';

export const useImageAnalysis = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { logout, authState } = useAuth();

  const handleCameraCapture = async (imageData: string) => {
    setLoading(true);
    try {
      const data = await analyzeImage(imageData, authState.accessToken || undefined);
      setResults(data);
      return data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
      } else {
        Alert.alert('Error', error?.message || 'Failed to analyze image');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (data: any) => {
    setResults(data);
  };

  return {
    handleCameraCapture,
    handleUploadComplete,
    results,
    loading,
    setResults,
  };
};