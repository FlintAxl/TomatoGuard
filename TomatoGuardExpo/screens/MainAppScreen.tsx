// src/screens/MainAppScreen.tsx
import React, { useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
  StyleSheet 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackNavigationProp, RootStackNavigationProp } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import ProtectedRoute from '../components/ProtectedRoute';
import AboutScreen from './AboutScreen';
import ProfileScreen from './ProfileScreen';
import CreatePostScreen from './CreatePostScreen';
import PostDetailScreen from './PostDetailScreen';
import { useDrawer } from '../hooks/useDrawer';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { appStyles } from '../styles';
import Drawer from '../components/common/Drawer/Drawer';
import MainLayout from '../components/common/Layout/MainLayout';
import ForumScreen from './ForumScreen';
import FloatingActionButton from '../components/common/Layout/FloatingButton';

const MainAppScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const mainNavigation = useNavigation<MainStackNavigationProp>();
  const { logout, authState } = useAuth();
  const { drawerOpen, drawerAnimation, toggleDrawer, closeDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState('camera');
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const { handleCameraCapture, handleUploadComplete, results, loading } = useImageAnalysis(setActiveTab);

  const navigateToPostDetail = (postId: string) => {
    setCurrentPostId(postId);
    setActiveTab('postdetail');
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        await logout();
        window.location.href = '/';
      }
    } else {
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth', params: { screen: 'Login' } }],
              });
            }
          },
        ]
      );
    }
  };

  const handleNavItemPress = (itemId: string) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }
    if (itemId === 'admin') {
      mainNavigation.navigate('AdminDashboard');
      return;
    }
    if (itemId === 'landingpage') {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
    return;
  }
  if (itemId === 'forums') {
    setActiveTab('forum');
    closeDrawer();
    return;
  }
  if (itemId === 'profile') {
    setActiveTab('profile');
    closeDrawer();
    return;
  }
    setActiveTab(itemId);
    closeDrawer();
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'camera': return 'Capture plant images for real-time analysis';
      case 'upload': return 'Upload multiple images for batch processing';
      case 'results': return 'View detailed analysis and recommendations';
      case 'forum': return 'Community discussion and support';
      case 'createpost': return 'Create a new forum post';
      case 'postdetail': return 'View post details and comments';
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
            <CameraCapture onCapture={handleCameraCapture} />
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
      case 'forum':
        return (
          <View style={styles.contentPadding}>
            <ForumScreen setActiveTab={setActiveTab} navigateToPostDetail={navigateToPostDetail} />
          </View>
        );
      case 'createpost':
        return (
          <View style={styles.contentPadding}>
            <CreatePostScreen setActiveTab={setActiveTab} />
          </View>
        );
      case 'postdetail':
        return (
          <View style={styles.contentPadding}>
            <PostDetailScreen setActiveTab={setActiveTab} postId={currentPostId} />
          </View>
        );
      case 'profile':
        return (
          <View style={styles.contentPadding}>
            <ProfileScreen />
          </View>
        );
      default:
        return null;
    }
  };

  const styles = appStyles;
  const pageTitle = (() => {
    switch (activeTab) {
      case 'camera': return 'Camera Capture';
      case 'upload': return 'Upload Images';
      case 'results': return 'Analysis Results';
      case 'forum': return 'Forums';
      case 'createpost': return 'Create Post';
      case 'postdetail': return 'Post Details';
      case 'about': return 'About System';
      default: return 'TomatoGuard';
    }
  })();

  return (
    <ProtectedRoute>
      <View style={localStyles.container}>
        {/* Main Content - Full Width */}
        <MainLayout
          drawerOpen={drawerOpen}
          drawerAnimation={drawerAnimation}
          pageTitle={pageTitle}
          pageSubtitle={getPageSubtitle()}
          userEmail={authState.user?.email?.split('@')[0]}
          onMenuPress={toggleDrawer}
          onCloseDrawer={closeDrawer}
        >
          <ScrollView style={styles.contentArea}>
            {renderContent()}
          </ScrollView>
        </MainLayout>

        {/* Drawer Overlay */}
        <Drawer
          activeTab={activeTab}
          onItemPress={handleNavItemPress}
          animation={drawerAnimation}
          drawerOpen={drawerOpen}
          onClose={closeDrawer}
        />

        {/* Floating Action Button - Always Visible */}
        <FloatingActionButton onItemPress={handleNavItemPress} />
      </View>
    </ProtectedRoute>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', // Important: allows drawer and FAB to overlay
  },
});

export default MainAppScreen;