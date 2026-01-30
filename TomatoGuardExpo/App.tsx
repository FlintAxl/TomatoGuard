// TomatoGuardExpo/src/App.tsx
import { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Platform, 
  Animated, 
  Dimensions,
  Alert 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CameraCapture from './components/CameraCapture';
import ImageUpload from './components/ImageUpload';
import ResultsDisplay from './components/ResultsDisplay';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { appStyles } from './styles';
import ProfileScreen from './screens/ProfileScreen';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// Create MainApp component that requires authentication
const MainApp = ({ navigation }: { navigation: any }) => {
  const { logout, authState } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('camera');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(Platform.OS === 'web');
  const drawerAnimation = useRef(new Animated.Value(Platform.OS === 'web' ? 1 : 0)).current;

  // Add logout to nav items
  const navItems: NavItem[] = [
    { id: 'camera', label: 'Camera Capture', icon: '📷' },
    { id: 'upload', label: 'Upload Images', icon: '📁' },
    { id: 'results', label: 'Analysis Results', icon: '📊' },
    { id: 'about', label: 'About System', icon: 'ℹ️' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'logout', label: 'Logout', icon: '🚪' },
  ];

const handleLogout = async () => {
  // For web, use browser's confirm dialog
  if (Platform.OS === 'web') {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      // Use navigation reset for web
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      // Also force reload for web to clear state
      if (Platform.OS === 'web') {
        window.location.href = '/';
      }
    }
  } else {
    // For mobile, use Alert
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // REPLACE current screen with Login
            navigation.replace('Login');
          }
        },
      ]
    );
  }
};
const handleNavItemPress = (itemId: string) => {
  console.log('Clicked nav item:', itemId);
  
  if (itemId === 'logout') {
    handleLogout();
    return;
  }
  
  console.log('Setting activeTab to:', itemId);
  setActiveTab(itemId);
  closeDrawer();
};

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

      // Determine the correct API URL
      let finalApiUrl: string;
      
      if (Platform.OS === 'web') {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
        const isNgrok = currentOrigin.includes('.ngrok-free.dev') || 
                        currentOrigin.includes('.exp.direct') || 
                        currentOrigin.includes('.ngrok.io');
        
        if (isNgrok) {
          finalApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        } else {
          finalApiUrl = 'http://localhost:8000';
        }
      } else {
        finalApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      }

      console.log('Uploading capture to:', finalApiUrl);

      let data: any;

      // Get token from auth state
      const token = authState.accessToken;
      
      if (Platform.OS === 'web') {
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${finalApiUrl}/api/analyze/upload`, {
          method: 'POST',
          body: formData,
          headers,
        });

        console.log('Capture response status (web):', response.status);

        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please login again');
          logout();
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        data = await response.json();
      } else {
        const config = {
          headers: { 
            'Content-Type': 'multipart/form-data',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          timeout: 30000,
        };

        const response = await axios.post(`${finalApiUrl}/api/analyze/upload`, formData, config);

        console.log('Capture response status (mobile):', response.status);
        data = response.data;
      }

      console.log('Capture success response:', data);
      setResults(data);
      setActiveTab('results');
    } catch (error: any) {
      console.error('Error uploading captured image:', error);
      if (error?.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
      } else {
        alert(`Failed to analyze image: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (data: any) => {
    setResults(data);
    setActiveTab('results');
  };

  const toggleDrawer = () => {
    const toValue = drawerOpen ? 0 : 1;
    setDrawerOpen(!drawerOpen);
    
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    if (drawerOpen) {
      setDrawerOpen(false);
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'camera': return 'Capture plant images for real-time analysis';
      case 'upload': return 'Upload multiple images for batch processing';
      case 'results': return 'View detailed analysis and recommendations';
      case 'profile': return 'View and manage your account information';
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

        case 'profile':
      return <ProfileScreen />;

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
  const { width } = Dimensions.get('window');
  const SIDEBAR_WIDTH = 280;
  const COLLAPSED_WIDTH = 0;

  // Drawer slide animation for mobile (slides in from left)
  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  // Drawer width animation for web (collapses width)
  const drawerWidth = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, SIDEBAR_WIDTH],
  });

  // Overlay opacity animation
  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Drawer Overlay - Only on mobile */}
        {Platform.OS !== 'web' && drawerOpen && (
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={closeDrawer}
          >
            <Animated.View
              style={[
                styles.drawerOverlayBg,
                { opacity: overlayOpacity }
              ]}
            />
          </TouchableOpacity>
        )}

        {/* Drawer Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              width: Platform.OS === 'web' ? drawerWidth : SIDEBAR_WIDTH,
              transform: Platform.OS === 'web' ? [] : [{ translateX: drawerTranslateX }],
              position: Platform.OS === 'web' ? 'relative' : 'absolute',
              height: '100%',
              zIndex: 1000,
              overflow: 'hidden',
            }
          ]}
        >
          <View style={styles.sidebarHeader}>
              <View style={styles.sidebarHeaderTop}>
                <Animated.View style={{ opacity: drawerAnimation }}>
                  <Text style={styles.logo}>TomatoGuard</Text>
                </Animated.View>
                {Platform.OS !== 'web' && drawerOpen && (
                  <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            <Animated.View style={{ opacity: drawerAnimation }}>
              <Text style={styles.logoSubtitle}>PLANT DISEASE DETECTION SYSTEM</Text>
            </Animated.View>
          </View>
          
          <Animated.View style={[styles.navMenu, { opacity: drawerAnimation }]}>
            <ScrollView>
              {navItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
                  onPress={() => handleNavItemPress(item.id)}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text style={[styles.navText, activeTab === item.id && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.topBar}>
            <View style={styles.topBarHeader}>
              <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
              <View style={styles.topBarTitleContainer}>
                <Text style={styles.pageTitle}>
                  {navItems.find(item => item.id === activeTab)?.label}
                </Text>
                <Text style={styles.pageSubtitle}>
                  {getPageSubtitle()}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                {authState.user?.email?.split('@')[0]}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.contentArea}>
            {renderContent()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
};

// Create Stack Navigator
const Stack = createNativeStackNavigator();

// AppNavigator component with authentication logic
const AppNavigator = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.user && authState.accessToken ? (
          // Authenticated - show main app
          <Stack.Screen name="MainApp" component={MainApp} />
        ) : (
          // Not authenticated - show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;