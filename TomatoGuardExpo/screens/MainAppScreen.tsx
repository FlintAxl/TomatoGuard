// src/screens/MainAppScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
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
import { useDrawer } from '../hooks/useDrawer';
import { useImageAnalysis } from '../hooks/useImageAnalysis';
import { appStyles } from '../styles';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import ProtectedRoute from '../components/ProtectedRoute';
import AboutScreen from './AboutScreen';
import ProfileScreen from './ProfileScreen';
import CreatePostScreen from './CreatePostScreen';
import PostDetailScreen from './PostDetailScreen';
import Drawer from '../components/Layout/Drawer';
import MainLayout from '../components/Layout/MainLayout';
import ForumScreen from './ForumScreen';
import FloatingActionButton from '../components/Layout/FloatingButton';
import BlogsList from './BlogsListScreen';
import BlogOne from './blogs/BlogOne';
import BlogTwo from './blogs/BlogTwo';
import BlogThree from './blogs/BlogThree';
import BlogFour from './blogs/BlogFour';
import BlogFive from './blogs/BlogFive';
import BlogSix from './blogs/BlogSix';
import AboutPageScreen from './AboutPageScreen';
import TrendScreen from './TrendScreen';

// Screens that manage their own scrolling and must NOT be inside the outer ScrollView
const SELF_SCROLLING_TABS = ['forum'];

const MainAppScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const mainNavigation = useNavigation<MainStackNavigationProp>();
  const { logout, authState } = useAuth();
  const { drawerOpen, drawerAnimation, toggleDrawer, closeDrawer } = useDrawer();
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
  
  const params = route.params as any;
  const initialTab = params?.initialTab || 'forum';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const { handleCameraCapture, handleUploadComplete, results, loading } = useImageAnalysis(setActiveTab);

  useEffect(() => {
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [params?.initialTab]);

  const navigateToPostDetail = (postId: string) => {
    setCurrentPostId(postId);
    setActiveTab('postdetail');
  };

  const navigateToBlog = (blogId: string) => {
    setCurrentBlogId(blogId);
    setActiveTab(blogId);
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
    if (itemId === 'trends') {
      setActiveTab('trends');
      closeDrawer();
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
    if (itemId === 'about') {
      setActiveTab('about');
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
      case 'trends': return 'Featured disease spotlight and detection trends';
      case 'blogs': return 'Expert insights on tomato cultivation and health';
      case 'blogone': return 'Disease identification and prevention guide';
      case 'blogtwo': return 'Nutritional information and health benefits';
      case 'blogthree': return 'Complete guide to tomato health benefits';
      case 'blogfour': return 'The history of tomato in the kitchen';
      case 'blogfive': return 'Different species of tomato';
      case 'blogsix': return 'Stages and timelines of growing a tomato';
      default: return '';
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
      case 'trends': return 'Trends';
      case 'about': return 'About System';
      default: return 'TomatoGuard';
    }
  })();

  // Content that needs its own scroll management (no outer ScrollView wrapper)
  const renderSelfScrollingContent = () => {
    switch (activeTab) {
      case 'forum':
        return (
          <ForumScreen
            setActiveTab={setActiveTab}
            navigateToPostDetail={navigateToPostDetail}
          />
        );
      default:
        return null;
    }
  };

  // Content that lives inside the outer ScrollView
  const renderScrollableContent = () => {
    if (loading) {
      return (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={localStyles.loadingText}>Analyzing images...</Text>
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
      case 'about':
        return (
          <View style={styles.contentPadding}>
            <AboutPageScreen />
          </View>
        );
      case 'trends':
        return (
          <View style={styles.contentPadding}>
            <TrendScreen />
          </View>
        );
      case 'blogs':
        return (
          <View style={styles.contentPadding}>
            <BlogsList setActiveTab={setActiveTab} navigateToBlog={navigateToBlog} />
          </View>
        );
      case 'blogone':
        return (
          <View style={styles.contentPadding}>
            <BlogOne />
          </View>
        );
      case 'blogtwo':
        return (
          <View style={styles.contentPadding}>
            <BlogTwo />
          </View>
        );
      case 'blogthree':
        return (
          <View style={styles.contentPadding}>
            <BlogThree />
          </View>
        );
        case 'blogfour':
          return (
            <View style={styles.contentPadding}>
              <BlogFour />
            </View>
          );
        case 'blogfive':
          return (
            <View style={styles.contentPadding}>
              <BlogFive />
            </View>
          );
        case 'blogsix':
          return (
            <View style={styles.contentPadding}>
              <BlogSix />
            </View>
          );
      default:
        return null;
    }
  };

  const isSelfScrolling = SELF_SCROLLING_TABS.includes(activeTab);

  return (
    <ProtectedRoute>
      <View style={localStyles.container}>
        <MainLayout
          drawerOpen={drawerOpen}
          drawerAnimation={drawerAnimation}
          pageTitle={pageTitle}
          pageSubtitle={getPageSubtitle()}
          userEmail={authState.user?.email?.split('@')[0]}
          onMenuPress={toggleDrawer}
          onCloseDrawer={closeDrawer}
        >
          {isSelfScrolling ? (
            // Forum (and any future self-scrolling screens): rendered directly,
            // filling all remaining space below the header with NO outer ScrollView
            <View style={localStyles.selfScrollingContainer}>
              {renderSelfScrollingContent()}
            </View>
          ) : (
            // All other tabs: wrapped in the standard outer ScrollView
            <ScrollView style={styles.contentArea}>
              {renderScrollableContent()}
            </ScrollView>
          )}
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
  },
  selfScrollingContainer: {
    flex: 1,
    overflow: 'hidden' as any,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default MainAppScreen;