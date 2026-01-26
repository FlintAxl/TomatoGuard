import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { cameraCaptureStyles, cardStyles, buttonStyles } from '../styles';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const startCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setIsCameraActive(true);
  };

  const capture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo.uri) {
        setCapturedImage(photo.uri);
        console.log('Photo captured:', photo.uri);
        
        if (Platform.OS === 'web') {
          onCapture(photo.uri);
        } else {
          onCapture(photo.uri);
        }
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
    
    setIsCapturing(false);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={cardStyles.card}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={[styles.placeholderText, { marginTop: 16 }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Camera Access Required</Text>
        <Text style={cardStyles.cardDescription}>
          Camera access is required to capture images of tomato plants for analysis. Please grant permission to continue.
        </Text>
        <TouchableOpacity style={buttonStyles.primaryButton} onPress={startCamera}>
          <Text style={buttonStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isCameraActive && !capturedImage) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Camera Capture</Text>
        <Text style={cardStyles.cardDescription}>
          Position your device camera to capture clear images of tomato plant leaves, fruits, or stems. Ensure adequate lighting for best results.
        </Text>
        
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderIcon}>📸</Text>
          <Text style={styles.placeholderText}>Camera Ready</Text>
          <Text style={[styles.placeholderText, { fontSize: 13, marginTop: 8 }]}>
            Back camera will be activated
          </Text>
        </View>
        
        <TouchableOpacity style={buttonStyles.primaryButton} onPress={startCamera}>
          <Text style={buttonStyles.buttonText}>Activate Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Image Captured Successfully</Text>
        <Text style={cardStyles.cardDescription}>
          Review your captured image below. You can retake the photo or proceed with analysis.
        </Text>
        
        <View style={styles.previewContainer}>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.placeholderIcon}>✓</Text>
            <Text style={styles.previewText}>Image captured successfully</Text>
            <Text style={[styles.previewText, { fontSize: 12, marginTop: 8 }]}>
              Ready for analysis
            </Text>
          </View>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity style={buttonStyles.outlineButton} onPress={handleRetake}>
            <Text style={buttonStyles.outlineButtonText}>Retake Photo</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity style={buttonStyles.primaryButton} onPress={handleUsePhoto}>
            <Text style={buttonStyles.buttonText}>Analyze Image</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardTitle}>Camera Active</Text>
      <Text style={cardStyles.cardDescription}>
        Position the camera to focus on the plant part you want to analyze.
      </Text>
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={buttonStyles.outlineButton} onPress={toggleCamera}>
          <Text style={buttonStyles.outlineButtonText}>🔄 Switch</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.captureButton, 
            isCapturing && styles.captureButtonDisabled
          ]} 
          onPress={capture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.captureIcon}>📸</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={buttonStyles.outlineButton} 
          onPress={() => {
            setIsCameraActive(false);
            setCapturedImage(null);
          }}
        >
          <Text style={buttonStyles.outlineButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = cameraCaptureStyles;

export default CameraCapture;