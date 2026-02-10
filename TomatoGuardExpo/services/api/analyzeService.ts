import { Platform } from 'react-native';
import { getApiClient } from './client';

export const analyzeImage = async (imageData: string, token?: string) => {
  const apiClient = getApiClient(token);
  
  let formData = new FormData();
  
  if (Platform.OS === 'web') {
    const response = await fetch(imageData);
    const blob = await response.blob();
    formData.append('file', blob, 'capture.jpg');
  } else {
    const uri = imageData;
    const name = uri.split('/').pop() || 'capture.jpg';
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name,
    } as any);
  }

  const uploadConfig: any = {};
  if (Platform.OS !== 'web') {
    uploadConfig.headers = { 'Content-Type': 'multipart/form-data' };
    uploadConfig.transformRequest = (data: any) => data;
  }

  const response = await apiClient.post('/api/analyze/upload', formData, uploadConfig);

  return response.data;
};

export const analyzeBatchImages = async (files: Array<{ uri: string; name: string }>, token?: string) => {
  const apiClient = getApiClient(token);
  const formData = new FormData();

  if (Platform.OS === 'web') {
    await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('files', blob, file.name);
      })
    );
  } else {
    files.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        name: file.name,
        type: 'image/jpeg',
      } as any);
    });
  }

  const batchConfig: any = {};
  if (Platform.OS !== 'web') {
    batchConfig.headers = { 'Content-Type': 'multipart/form-data' };
    batchConfig.transformRequest = (data: any) => data;
  }

  const response = await apiClient.post('/api/analyze/batch', formData, batchConfig);

  return response.data;
};