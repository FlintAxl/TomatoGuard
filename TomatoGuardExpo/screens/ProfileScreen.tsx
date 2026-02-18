import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { getApiClient } from '../services/api/client';
import { forumService } from '../services/api/forumService';
import { FontAwesome5 } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52',
  textLight: '#ffffff',
  textDark: '#0d1f14',
  textMuted: '#5a7a65',
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
};

interface UserPost {
  id: string;
  title: string;
  description: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  category: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const { authState, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfilePic, setEditProfilePic] = useState<string | null>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!authState.accessToken) return;
    
    setLoading(true);
    try {
      const client = getApiClient(authState.accessToken);
      const response = await client.get('/api/v1/auth/me');
      const data = response.data;
      setUserData(data);
      updateUser(data);
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      if (error.response?.status === 401) {
        if (Platform.OS === 'web') {
          window.alert('Session Expired. Please login again.');
        } else {
          Alert.alert('Session Expired', 'Please login again');
        }
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!authState.accessToken || !authState.user?.id) return;
    
    try {
      setLoadingPosts(true);
      const fetchedPosts = await forumService.getUserPosts(authState.user.id, authState.accessToken);
      const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];
      setUserPosts(postsArray);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (authState.user) {
      setUserData(authState.user);
    }
    if (authState.accessToken) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [authState.accessToken]);

  const openEditModal = () => {
    setEditName(userData?.full_name || '');
    setEditEmail(userData?.email || '');
    setEditProfilePic(userData?.profile_picture || null);
    setNewImageUri(null);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('Permission Required: Please allow access to your photo library.');
      } else {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const client = getApiClient(authState.accessToken || undefined);
      const response = await client.post('/api/v1/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...(Platform.OS !== 'web' && {
          transformRequest: (data: any) => data,
        }),
      });

      return response.data?.url || response.data?.secure_url || null;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Name is required');
      } else {
        Alert.alert('Error', 'Name is required');
      }
      return;
    }
    if (!editEmail.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Email is required');
      } else {
        Alert.alert('Error', 'Email is required');
      }
      return;
    }

    setEditLoading(true);
    try {
      let profilePictureUrl = editProfilePic;

      if (newImageUri) {
        const uploadedUrl = await uploadImage(newImageUri);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          if (Platform.OS === 'web') {
            window.alert('Failed to upload image. Profile will be updated without new picture.');
          } else {
            Alert.alert('Warning', 'Failed to upload image. Profile will be updated without new picture.');
          }
        }
      }

      const client = getApiClient(authState.accessToken || undefined);
      const params = new URLSearchParams();
      params.append('full_name', editName.trim());
      params.append('email', editEmail.trim());
      if (profilePictureUrl) {
        params.append('profile_picture', profilePictureUrl);
      }

      const response = await client.put(`/api/v1/auth/me?${params.toString()}`);
      const updatedUser = response.data;

      setUserData(updatedUser);
      updateUser(updatedUser);
      setEditModalVisible(false);
      
      // Refresh profile data
      fetchUserProfile();
      
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.detail || 'Failed to update profile';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        doLogout();
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
            onPress: doLogout,
          },
        ]
      );
    }
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('Forum', {
      screen: 'PostDetail',
      params: { postId }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderPostItem = (post: UserPost) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postItem}
      onPress={() => handlePostPress(post.id)}
      activeOpacity={0.7}
    >
      <View style={styles.postItemContent}>
        <Text style={styles.postItemTitle} numberOfLines={1}>{post.title}</Text>
        <Text style={styles.postItemMeta}>
          {post.likes_count} likes • {post.comments_count} comments • {formatDate(post.created_at)}
        </Text>
      </View>
      {post.image_urls && post.image_urls.length > 0 && (
        <View style={styles.postItemImageContainer}>
          <Image source={{ uri: post.image_urls[0] }} style={styles.postItemImage} />
          {post.image_urls.length > 1 && (
            <View style={styles.postImageBadge}>
              <Text style={styles.postImageBadgeText}>+{post.image_urls.length}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentGreen} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!authState.user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.emptyIconWrap}>
            <FontAwesome5 name="user" size={36} color={COLORS.accentGreen} />
          </View>
          <Text style={styles.emptyText}>Please login to view your profile</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayImage = newImageUri || editProfilePic || userData?.profile_picture;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header with Cover */}
        <View style={styles.profileCover}>
          <View style={styles.coverGradient} />
          
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={openEditModal} style={styles.avatarWrapper}>
              {userData?.profile_picture ? (
                <Image source={{ uri: userData.profile_picture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <FontAwesome5 name="user" size={isSmallDevice ? 40 : 50} color={COLORS.textLight} />
                </View>
              )}
              <View style={styles.editAvatarBadge}>
                <FontAwesome5 name="camera" size={12} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData?.full_name || 'User Name'}</Text>
            <Text style={styles.userUsername}>@{userData?.username || 'username'}</Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            
            {userData?.role === 'admin' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Admin</Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData?.total_likes_received || 0}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData?.total_comments_received || 0}</Text>
                <Text style={styles.statLabel}>Comments</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Account Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="user" size={14} color={COLORS.accentGreen} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userData?.full_name || 'Not set'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="envelope" size={14} color={COLORS.accentGreen} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData?.email}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <FontAwesome5 name="circle" size={14} color={userData?.is_active ? COLORS.accentGreen : COLORS.errorRed} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: userData?.is_active ? COLORS.accentGreen : COLORS.errorRed }]}>
                {userData?.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          {userData?.created_at && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <FontAwesome5 name="calendar" size={14} color={COLORS.accentGreen} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{new Date(userData.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* My Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>My Posts</Text>
            </View>
            {userPosts.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Forum')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingPosts ? (
            <View style={styles.postsLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.accentGreen} />
              <Text style={styles.postsLoadingText}>Loading posts...</Text>
            </View>
          ) : userPosts.length === 0 ? (
            <View style={styles.emptyPostsContainer}>
              <View style={styles.emptyIconWrap}>
                <FontAwesome5 name="edit" size={24} color={COLORS.accentGreen} />
              </View>
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              <Text style={styles.emptyPostsSubtext}>Start sharing with the community!</Text>
              <TouchableOpacity style={styles.createPostButton} onPress={() => navigation.navigate('Forum')}>
                <Text style={styles.createPostButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.postsList}>
              {userPosts.slice(0, 3).map(renderPostItem)}
              {userPosts.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Forum')}>
                  <Text style={styles.viewAllButtonText}>View All {userPosts.length} Posts</Text>
                  <FontAwesome5 name="arrow-right" size={12} color={COLORS.accentGreen} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <FontAwesome5 name="user-edit" size={16} color={COLORS.textLight} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={16} color={COLORS.errorRed} />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>TomatoGuard</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <FontAwesome5 name="times" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture */}
              <TouchableOpacity style={styles.editAvatarContainer} onPress={pickImage}>
                {displayImage ? (
                  <Image source={{ uri: displayImage }} style={styles.editAvatar} />
                ) : (
                  <View style={[styles.editAvatar, styles.avatarPlaceholder]}>
                    <FontAwesome5 name="user" size={40} color={COLORS.textLight} />
                  </View>
                )}
                <View style={styles.editAvatarBadge}>
                  <FontAwesome5 name="camera" size={14} color={COLORS.textLight} />
                </View>
              </TouchableOpacity>
              <Text style={styles.editAvatarHint}>Tap to change photo</Text>

              {/* Name Input */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Email Input */}
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, editLoading && styles.saveBtnDisabled]}
                onPress={handleSaveProfile}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color={COLORS.textLight} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 20,
  },
  profileCover: {
    backgroundColor: COLORS.darkGreen,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
    borderWidth: 4,
    borderColor: COLORS.accentGreen,
  },
  avatarPlaceholder: {
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: isSmallDevice ? 50 : 60,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.accentGreen,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accentGreen,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  roleBadgeText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  card: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    fontStyle: 'italic',
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0ddd6',
    marginLeft: 44,
  },
  postsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  postsLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  postsLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  emptyPostsContainer: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  emptyPostsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  emptyPostsSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  createPostButton: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  postsList: {
    gap: 8,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  postItemContent: {
    flex: 1,
    marginRight: 12,
  },
  postItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  postItemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  postItemImageContainer: {
    position: 'relative',
  },
  postItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  postImageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
  },
  postImageBadgeText: {
    color: COLORS.textLight,
    fontSize: 9,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    borderRadius: 10,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: COLORS.accentGreen,
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 16,
    borderRadius: 12,
  },
  editBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.errorRed,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutBtnText: {
    color: COLORS.errorRed,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  primaryBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 20,
  },
  appName: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  appVersion: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgCream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  editAvatarContainer: {
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    color: COLORS.textDark,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textDark,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  saveBtn: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;