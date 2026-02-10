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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { getApiClient } from '../services/api/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { authState, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
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
        Alert.alert('Session Expired', 'Please login again');
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user) {
      setUserData(authState.user);
    }
    if (authState.accessToken) {
      fetchUserProfile();
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
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
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

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

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
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!editEmail.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setEditLoading(true);
    try {
      let profilePictureUrl = editProfilePic;

      // Upload new image if selected
      if (newImageUri) {
        const uploadedUrl = await uploadImage(newImageUri);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          Alert.alert('Warning', 'Failed to upload image. Profile will be updated without new picture.');
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
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      const message = error.response?.data?.detail || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = async () => {
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
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  if (loading && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!authState.user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>👤</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData?.profile_picture ? (
              <Image source={{ uri: userData.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {userData?.full_name?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email}</Text>
          {userData?.role === 'admin' && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{userData?.full_name || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: userData?.is_active ? '#10b981' : '#ef4444' }]} />
              <Text style={styles.infoValue}>{userData?.is_active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          {userData?.created_at && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{new Date(userData.created_at).toLocaleDateString()}</Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
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
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture */}
              <TouchableOpacity style={styles.editAvatarContainer} onPress={pickImage}>
                {displayImage ? (
                  <Image source={{ uri: displayImage }} style={styles.editAvatar} />
                ) : (
                  <View style={[styles.editAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {editName?.[0]?.toUpperCase() || editEmail?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.editAvatarBadge}>
                  <Text style={styles.editAvatarBadgeText}>📷</Text>
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
                placeholderTextColor="#64748b"
              />

              {/* Email Input */}
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor="#64748b"
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
                  <ActivityIndicator color="#fff" />
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

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  } as const,
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  } as const,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  } as const,
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  } as const,
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 20,
  } as const,
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  } as const,
  avatarContainer: {
    marginBottom: 16,
  } as const,
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  } as const,
  avatarPlaceholder: {
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '700',
  } as const,
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  } as const,
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  } as const,
  roleBadge: {
    marginTop: 8,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  } as const,
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  } as const,
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  } as const,
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  } as const,
  infoLabel: {
    color: '#64748b',
    fontSize: 14,
  } as const,
  infoValue: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  } as const,
  divider: {
    height: 1,
    backgroundColor: '#334155',
  } as const,
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as const,
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  } as const,
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  } as const,
  editBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  } as const,
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  logoutBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  } as const,
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  primaryBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  } as const,
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  appInfo: {
    alignItems: 'center',
    paddingTop: 20,
  } as const,
  appName: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  } as const,
  appVersion: {
    color: '#334155',
    fontSize: 12,
    marginTop: 4,
  } as const,
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  } as const,
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  } as const,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  } as const,
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  } as const,
  modalClose: {
    color: '#64748b',
    fontSize: 24,
    padding: 4,
  } as const,
  editAvatarContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  } as const,
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  } as const,
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e293b',
  } as const,
  editAvatarBadgeText: {
    fontSize: 14,
  } as const,
  editAvatarHint: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  } as const,
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  } as const,
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    color: '#f1f5f9',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  } as const,
  saveBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  } as const,
  saveBtnDisabled: {
    opacity: 0.7,
  } as const,
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as const,
};

export default ProfileScreen;