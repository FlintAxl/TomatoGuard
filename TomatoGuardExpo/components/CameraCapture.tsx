import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { cameraCaptureStyles, cardStyles, buttonStyles } from '../styles';
import Slider from '@react-native-community/slider';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const [zoom, setZoom] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  const captureImage = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    setIsCapturing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        exif: true,
      });
      
      if (photo.uri) {
        setCapturedImage(photo.uri);
        console.log('Photo captured successfully:', photo.uri);
        
        // Show preview for 1 second before auto-analyzing
        setTimeout(() => {
          handleUsePhoto();
        }, 1000);
        
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      setIsLoading(true);
      setTimeout(() => {
        onCapture(capturedImage);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on': return '⚡';
      case 'off': return '⚡❌';
      default: return '⚡🔍';
    }
  };

  const renderCameraPreview = () => (
    <View style={cameraCaptureStyles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={cameraCaptureStyles.cameraPreview}
        facing={cameraType}
        flash={flashMode}
        zoom={zoom}
      />
      
      {/* Focus frame overlay */}
      <View style={cameraCaptureStyles.focusFrame} />
      
      {/* Grid overlay */}
      <View style={cameraCaptureStyles.gridOverlay}>
        <View style={cameraCaptureStyles.gridRow}>
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
        </View>
        <View style={cameraCaptureStyles.gridRow}>
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
        </View>
        <View style={cameraCaptureStyles.gridRow}>
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
          <View style={cameraCaptureStyles.gridDot} />
        </View>
      </View>
      
      {/* Flash control */}
      <TouchableOpacity 
        style={cameraCaptureStyles.flashButton} 
        onPress={toggleFlash}
      >
        <Text style={cameraCaptureStyles.flashIcon}>{getFlashIcon()}</Text>
      </TouchableOpacity>
      
      {/* Status indicator */}
      <View style={cameraCaptureStyles.statusIndicator}>
        <View style={cameraCaptureStyles.statusDot} />
        <Text style={cameraCaptureStyles.statusText}>LIVE</Text>
      </View>
      
      {/* Zoom slider */}
<View style={cameraCaptureStyles.zoomButtonsContainer}>
  <TouchableOpacity 
    style={cameraCaptureStyles.zoomButton}
    onPress={() => setZoom(Math.min(1, zoom + 0.1))}
  >
    <Text style={cameraCaptureStyles.zoomIcon}>+</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={cameraCaptureStyles.zoomButton}
    onPress={() => setZoom(Math.max(0, zoom - 0.1))}
  >
    <Text style={cameraCaptureStyles.zoomIcon}>−</Text>
  </TouchableOpacity>
</View>
      
      {/* Instructions */}
      <View style={cameraCaptureStyles.instructionsOverlay}>
        <Text style={cameraCaptureStyles.instructionsText}>
          Focus on the plant part and tap the green button to capture
        </Text>
      </View>
      
      {/* Loading overlay during capture */}
      {isCapturing && (
        <View style={cameraCaptureStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={cameraCaptureStyles.loadingText}>Capturing...</Text>
        </View>
      )}
    </View>
  );

  const renderCameraControls = () => (
    <View style={cameraCaptureStyles.cameraControls}>
      {/* Toggle camera button */}
      <TouchableOpacity 
        style={cameraCaptureStyles.secondaryButton} 
        onPress={toggleCameraType}
      >
        <Text style={cameraCaptureStyles.secondaryIcon}>🔄</Text>
      </TouchableOpacity>
      
      {/* Main capture button */}
      <TouchableOpacity 
        style={[
          cameraCaptureStyles.captureButton,
          isCapturing && cameraCaptureStyles.captureButtonActive
        ]} 
        onPress={captureImage}
        disabled={isCapturing}
      >
        {isCapturing ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={cameraCaptureStyles.captureIcon}>📸</Text>
        )}
      </TouchableOpacity>
      
      {/* Close camera button */}
      <TouchableOpacity 
        style={cameraCaptureStyles.secondaryButton} 
        onPress={() => setIsCameraActive(false)}
      >
        <Text style={cameraCaptureStyles.secondaryIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderImagePreview = () => (
    <View style={cameraCaptureStyles.previewContainer}>
      <Image 
        source={{ uri: capturedImage! }} 
        style={cameraCaptureStyles.previewImage}
        resizeMode="cover"
      />
      
      <View style={cameraCaptureStyles.previewOverlay}>
        <Text style={cameraCaptureStyles.previewText}>
          ✓ Image captured successfully
        </Text>
      </View>
      
      {isLoading && (
        <View style={cameraCaptureStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={cameraCaptureStyles.loadingText}>Preparing for analysis...</Text>
        </View>
      )}
    </View>
  );

  const renderPreviewControls = () => (
    <View style={cameraCaptureStyles.cameraControls}>
      <TouchableOpacity 
        style={buttonStyles.outlineButton} 
        onPress={handleRetake}
        disabled={isLoading}
      >
        <Text style={buttonStyles.outlineButtonText}>Retake Photo</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={buttonStyles.primaryButton} 
        onPress={handleUsePhoto}
        disabled={isLoading}
      >
        <Text style={buttonStyles.buttonText}>
          {isLoading ? 'Processing...' : 'Analyze Image'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (!permission) {
    return (
      <View style={cardStyles.card}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={[cameraCaptureStyles.placeholderText, { marginTop: 16 }]}>
          Checking camera permissions...
        </Text>
      </View>
    );
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Camera Access Required</Text>
        <Text style={cardStyles.cardDescription}>
          Camera access is required to capture images of tomato plants for analysis. 
          Please grant permission to continue.
        </Text>
        
        <View style={cameraCaptureStyles.cameraPlaceholder}>
          <Text style={cameraCaptureStyles.placeholderIcon}>📷</Text>
          <Text style={cameraCaptureStyles.placeholderText}>Camera Disabled</Text>
        </View>
        
        <TouchableOpacity style={buttonStyles.primaryButton} onPress={startCamera}>
          <Text style={buttonStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Initial state - camera not active
  if (!isCameraActive && !capturedImage) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Camera Capture</Text>
        <Text style={cardStyles.cardDescription}>
          Position your device camera to capture clear images of tomato plant leaves, 
          fruits, or stems. Ensure adequate lighting for best results.
        </Text>
        
        <View style={cameraCaptureStyles.cameraPlaceholder}>
          <Text style={cameraCaptureStyles.placeholderIcon}>📸</Text>
          <Text style={cameraCaptureStyles.placeholderText}>Ready to Capture</Text>
          <Text style={[cameraCaptureStyles.placeholderText, { fontSize: 13, marginTop: 8 }]}>
            Tap below to activate camera
          </Text>
        </View>
        
        <TouchableOpacity style={buttonStyles.primaryButton} onPress={startCamera}>
          <Text style={buttonStyles.buttonText}>Activate Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Image preview state
  if (capturedImage) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Image Captured Successfully</Text>
        <Text style={cardStyles.cardDescription}>
          Review your captured image below. You can retake the photo or proceed with analysis.
        </Text>
        
        {renderImagePreview()}
        {renderPreviewControls()}
      </View>
    );
  }

  // Active camera state
  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardTitle}>Camera Active</Text>
      <Text style={cardStyles.cardDescription}>
        Position the camera to focus on the plant part you want to analyze. 
        Tap the green button to capture.
      </Text>
      
      {renderCameraPreview()}
      {renderCameraControls()}
    </View>
  );
};

export default CameraCapture;