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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authStyles, cardStyles, buttonStyles, profileStyles } from '../styles';

const ProfileScreen = ({ navigation }: any) => {
  const { authState, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const fetchUserProfile = async () => {
    if (!authState.accessToken) return;
    
    setLoading(true);
    try {
      // Use the correct API base URL
      let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      // For Expo web, check if we need ngrok
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const currentOrigin = window.location.origin;
        const isNgrok = currentOrigin.includes('.ngrok-free.dev') || 
                        currentOrigin.includes('.exp.direct') || 
                        currentOrigin.includes('.ngrok.io');
        
        if (isNgrok) {
          // Use localhost for ngrok to avoid CORS issues
          API_BASE_URL = 'http://localhost:8000';
        }
      }
      
      console.log('Fetching profile from:', `${API_BASE_URL}/api/v1/auth/me`);
      console.log('Token exists:', !!authState.accessToken);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // FIRST read as text to see what we're getting
      const responseText = await response.text();
      console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
      console.log('Response status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
      }

      // Check if it's valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response was:', responseText);
        
        // If it's HTML, we might have the wrong URL
        if (responseText.includes('<!DOCTYPE')) {
          throw new Error('Server returned HTML instead of JSON. Check API endpoint URL.');
        }
        throw new Error('Invalid JSON response from server');
      }
      
      setUserData(data);
      
      // Update global auth state with fresh data
      updateUser(data);
      
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      Alert.alert(
        'Profile Error', 
        error.message || 'Failed to load profile. Make sure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set initial data from authState
    if (authState.user) {
      setUserData(authState.user);
    }
    
    // Fetch fresh data if we have a token
    if (authState.accessToken) {
      fetchUserProfile();
    }
  }, [authState.accessToken]);

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
            // Use reset to clear navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  if (loading && !userData) {
    return (
      <View style={authStyles.authContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 16, color: '#64748b' }}>Loading profile...</Text>
      </View>
    );
  }

  if (!authState.user) {
    return (
      <View style={authStyles.authContainer}>
        <Text style={authStyles.authLogo}>👤</Text>
        <Text style={authStyles.authSubtitle}>Please login to view your profile</Text>
        <TouchableOpacity
          style={[authStyles.authButton, { marginTop: 20 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={authStyles.authButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Add Platform import at top if not already there
  // import { Platform } from 'react-native';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={cardStyles.card}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#10b981',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 32, color: 'white' }}>
                {userData?.full_name?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>
              {userData?.full_name || 'User'}
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b', marginTop: 4 }}>
              {userData?.email}
            </Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={cardStyles.cardTitle}>Account Information</Text>
            
            <View style={{ marginTop: 16 }}>
              <View style={profileStyles.infoRow}>
                <Text style={profileStyles.infoLabel}>Email</Text>
                <Text style={profileStyles.infoValue}>{userData?.email}</Text>
              </View>
              
              <View style={profileStyles.infoRow}>
                <Text style={profileStyles.infoLabel}>Full Name</Text>
                <Text style={profileStyles.infoValue}>{userData?.full_name || 'Not set'}</Text>
              </View>
              
              <View style={profileStyles.infoRow}>
                <Text style={profileStyles.infoLabel}>Account Status</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[
                    profileStyles.statusDot,
                    { backgroundColor: userData?.is_active ? '#10b981' : '#ef4444' }
                  ]} />
                  <Text style={profileStyles.infoValue}>
                    {userData?.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              {userData?.created_at && (
                <View style={profileStyles.infoRow}>
                  <Text style={profileStyles.infoLabel}>Member Since</Text>
                  <Text style={profileStyles.infoValue}>
                    {new Date(userData.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={cardStyles.cardTitle}>Account Actions</Text>
            
            <TouchableOpacity
              style={[buttonStyles.outlineButton, { marginTop: 16 }]}
              onPress={() => Alert.alert('Coming Soon', 'Edit profile feature coming soon!')}
            >
              <Text style={buttonStyles.outlineButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.outlineButton, { marginTop: 12 }]}
              onPress={() => Alert.alert('Coming Soon', 'Change password feature coming soon!')}
            >
              <Text style={buttonStyles.outlineButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[buttonStyles.primaryButton, { backgroundColor: '#ef4444' }]}
            onPress={handleLogout}
          >
            <Text style={buttonStyles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>App Information</Text>
          <Text style={cardStyles.cardDescription}>
            TomatoGuard - Plant Disease Detection System
          </Text>
          
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Version</Text>
            <Text style={profileStyles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>User ID</Text>
            <Text style={[profileStyles.infoValue, { fontSize: 12 }]}>
              {userData?.id?.substring(0, 12)}...
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;