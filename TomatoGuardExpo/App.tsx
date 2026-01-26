import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import CameraCapture from './components/CameraCapture';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { appStyles } from './styles';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const App = () => {
  const [activeTab, setActiveTab] = useState<string>('camera');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { id: 'camera', label: 'Camera Capture', icon: '📷' },
    { id: 'upload', label: 'Upload Images', icon: '📁' },
    { id: 'results', label: 'Analysis Results', icon: '📊' },
    { id: 'about', label: 'About System', icon: 'ℹ️' }
  ];

  const handleCameraCapture = async (imageData: string) => {
    setLoading(true);
    try {
      console.log('Starting camera capture analysis with:', imageData);

      let formData: FormData;

      if (Platform.OS === 'web') {
        console.log('Web platform - converting URI to blob');
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        console.log('Web blob created, size:', blob.size);
      } else {
        console.log('Mobile platform - using file URI');
        formData = new FormData();

        const uri = imageData;
        const name = uri.split('/').pop() || 'capture.jpg';
        const type = 'image/jpeg';

        formData.append('file', {
          uri,
          type,
          name,
        } as any);
        console.log('Mobile file object created:', { uri, name, type });
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      const finalApiUrl = Platform.OS === 'web' ? 'http://localhost:8000' : apiUrl;

      console.log('Uploading capture to:', finalApiUrl);

      let data: any;

      if (Platform.OS === 'web') {
        const response = await fetch(`${finalApiUrl}/api/analyze/upload`, {
          method: 'POST',
          body: formData,
        });

        console.log('Capture response status (web):', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        data = await response.json();
      } else {
        const response = await axios.post(`${finalApiUrl}/api/analyze/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        });

        console.log('Capture response status (mobile):', response.status);
        data = response.data;
      }

      console.log('Capture success response:', data);
      setResults(data);
      setActiveTab('results');
    } catch (error: any) {
      console.error('Error uploading captured image:', error);
      alert(`Failed to analyze image: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (data: any) => {
    setResults(data);
    setActiveTab('results');
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'camera': return 'Capture plant images for real-time analysis';
      case 'upload': return 'Upload multiple images for batch processing';
      case 'results': return 'View detailed analysis and recommendations';
      case 'about': return 'System information and technical specifications';
      default: return '';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Analyzing images...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'camera':
        return (
          <View style={styles.contentPadding}>
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setActiveTab('camera')}
            />
          </View>
        );

      case 'upload':
        return (
          <View style={styles.contentPadding}>
            <ImageUpload onUploadComplete={handleUploadComplete} />
          </View>
        );

      case 'results':
        return (
          <View style={styles.contentPadding}>
            <ResultsDisplay results={results} />
          </View>
        );

      case 'about':
        return (
          <ScrollView style={styles.contentArea}>
            <View style={styles.contentPadding}>
              <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <Text style={styles.sectionTitle}>TomatoGuard System</Text>
                <Text style={styles.text}>
                  TomatoGuard is an advanced AI-powered diagnostic system designed for the detection and analysis of diseases in tomato plants. Utilizing state-of-the-art MobileNetV2 deep learning models, the system provides accurate identification across multiple plant parts.
                </Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Supported Plant Parts</Text>
                  <Text style={styles.bulletText}>• Leaves: 6 disease classifications + healthy state</Text>
                  <Text style={styles.bulletText}>• Fruits: 4 disease classifications + healthy state</Text>
                  <Text style={styles.bulletText}>• Stems: 2 disease classifications + healthy state</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Key Features</Text>
                  <Text style={styles.bulletText}>• Automated plant part detection</Text>
                  <Text style={styles.bulletText}>• Real-time camera and batch upload support</Text>
                  <Text style={styles.bulletText}>• Comprehensive treatment recommendations</Text>
                  <Text style={styles.bulletText}>• Cross-platform compatibility</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Technology Stack</Text>
                  <Text style={styles.text}><Text style={styles.boldText}>ML Framework:</Text> TensorFlow MobileNetV2</Text>
                  <Text style={styles.text}><Text style={styles.boldText}>Backend:</Text> FastAPI (Python)</Text>
                  <Text style={styles.text}><Text style={styles.boldText}>Frontend:</Text> React Native (Expo)</Text>
                  <Text style={styles.text}><Text style={styles.boldText}>Storage:</Text> Cloudinary CDN</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const styles = appStyles;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.logo}>TomatoGuard</Text>
          <Text style={styles.logoSubtitle}>PLANT DISEASE DETECTION SYSTEM</Text>
        </View>
        
        <View style={styles.navMenu}>
          {navItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navText, activeTab === item.id && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>
            {navItems.find(item => item.id === activeTab)?.label}
          </Text>
          <Text style={styles.pageSubtitle}>
            {getPageSubtitle()}
          </Text>
        </View>

        <ScrollView style={styles.contentArea}>
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default App;