import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { imageUploadStyles, cardStyles, buttonStyles } from '../styles';

interface ImageUploadProps {
  onUploadComplete: (data: any) => void;
}

interface FileItem {
  uri: string;
  name: string;
  size: string;
}

const ImageUpload = ({ onUploadComplete }: ImageUploadProps) => {
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
      const formData = new FormData();
      
      files.forEach((file, index) => {
        if (Platform.OS === 'web') {
          fetch(file.uri)
            .then(response => response.blob())
            .then(blob => {
              formData.append('files', blob, file.name);
            });
        } else {
          const localUri = file.uri;
          const filename = localUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : `image`;
          
          formData.append('files', {
            uri: localUri,
            name: filename || `image_${index}.jpg`,
            type,
          } as any);
        }
      });

      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      const finalApiUrl = Platform.OS === 'web' ? 'http://localhost:8000' : apiUrl;
        
      console.log('Uploading to:', finalApiUrl);
      
      const axiosConfig =
        Platform.OS === 'web'
          ? undefined
          : {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 30000,
            };

      const response = await axios.post(`${finalApiUrl}/api/analyze/batch`, formData, axiosConfig);

      console.log("Upload response:", response.data);
      
      if (response.data.results && response.data.results[0]?.error) {
        console.error('Backend error:', response.data.results[0].error);
        Alert.alert('Analysis Error', response.data.results[0].error);
        return;
      }
      
      onUploadComplete?.(response.data);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Response data:', err.response?.data);
      setError(err.message || 'An error occurred during upload');
      Alert.alert('Upload Failed', err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Batch Image Upload</Text>
        <Text style={cardStyles.cardDescription}>
          Upload multiple images for comprehensive batch analysis. Supported formats: JPG, PNG (maximum 10MB per file).
        </Text>
        
        <TouchableOpacity style={styles.dropzone} onPress={pickImages}>
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.dropzoneText}>Select Images</Text>
          <Text style={styles.dropzoneHint}>Tap to browse your image library</Text>
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
            disabled={uploading || files.length === 0}
            style={[
              buttonStyles.primaryButton,
              { marginTop: 16 },
              (uploading || files.length === 0) && buttonStyles.buttonDisabled
            ]}
          >
            <Text style={buttonStyles.buttonText}>
              {uploading ? 'Analyzing...' : `Analyze ${files.length} Image${files.length > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = imageUploadStyles;

export default ImageUpload;