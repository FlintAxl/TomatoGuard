// src/components/ImageUpload.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { imageUploadStyles, cardStyles, buttonStyles } from '../styles';
import { analyzeBatchImages } from '../services/api/analyzeService';

interface ImageUploadProps {
  onUploadComplete: (data: any) => void;
}

interface FileItem {
  uri: string;
  name: string;
  size: string;
}

const ImageUpload = ({ onUploadComplete }: ImageUploadProps) => {
  const { authState, logout } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles: FileItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize ? `${(asset.fileSize / 1024).toFixed(1)} KB` : 'Unknown size',
        }));
        setFiles(prev => [...prev, ...newFiles]);
        setError('');
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Use the new service function
      const data = await analyzeBatchImages(
        files.map(file => ({ uri: file.uri, name: file.name })),
        authState.accessToken || undefined
      );
      
      console.log("Upload response:", data);
      
      if (data.results && data.results[0]?.error) {
        console.error('Backend error:', data.results[0].error);
        Alert.alert('Analysis Error', data.results[0].error);
        return;
      }
      
      onUploadComplete?.(data);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            { text: 'OK', onPress: () => logout() }
          ]
        );
        return;
      }
      
      // Extract error message from response
      let errorMessage = err.message || 'An error occurred during upload';
      
      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = Array.isArray(err.response.data.detail) 
            ? err.response.data.detail.map((d: any) => d.msg || d).join(', ')
            : err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Check if user is authenticated before showing upload button
  const isAuthenticated = authState.user && authState.accessToken;

  return (
    <View style={styles.container}>
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Batch Image Upload</Text>
        <Text style={cardStyles.cardDescription}>
          Upload multiple images for comprehensive batch analysis. Supported formats: JPG, PNG (maximum 10MB per file).
        </Text>
        
        {!isAuthenticated && (
          <View style={{ 
            backgroundColor: '#fef3c7', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#f59e0b'
          }}>
            <Text style={{ color: '#92400e', fontSize: 14 }}>
              ⚠️ Please login to upload and analyze images.
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.dropzone, 
            !isAuthenticated && { opacity: 0.6 }
          ]} 
          onPress={pickImages}
          disabled={!isAuthenticated}
        >
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.dropzoneText}>
            {isAuthenticated ? 'Select Images' : 'Login Required'}
          </Text>
          <Text style={styles.dropzoneHint}>
            {isAuthenticated ? 'Tap to browse your image library' : 'Please login first'}
          </Text>
        </TouchableOpacity>

        {error ? (
          <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 16 }}>
            <Text style={{ color: '#dc2626', fontSize: 14 }}>❌ {error}</Text>
          </View>
        ) : null}
      </View>

      {files.length > 0 && (
        <View style={cardStyles.card}>
          <View style={styles.fileListHeader}>
            <Text style={styles.fileListTitle}>Selected Files ({files.length})</Text>
            <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: 300, marginTop: 12 }}>
            {files.map((fileItem, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileIcon}>📷</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{fileItem.name}</Text>
                  <Text style={styles.fileSize}>{fileItem.size}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => removeFile(index)}
                  style={styles.removeButton}
                  disabled={uploading}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {uploading && (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={[cardStyles.cardDescription, { marginTop: 12, marginBottom: 0 }]}>
                Processing and analyzing images...
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploading || files.length === 0 || !isAuthenticated}
            style={[
              buttonStyles.primaryButton,
              { marginTop: 16 },
              (uploading || files.length === 0 || !isAuthenticated) && buttonStyles.buttonDisabled
            ]}
          >
            <Text style={buttonStyles.buttonText}>
              {!isAuthenticated ? 'Login Required' : 
               uploading ? 'Analyzing...' : 
               `Analyze ${files.length} Image${files.length > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = imageUploadStyles;

export default ImageUpload;