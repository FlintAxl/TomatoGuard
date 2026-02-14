// TomatoGuardExpo/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  profile_picture?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

interface AuthContextData {
  authState: AuthState;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  // Load stored auth data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (accessToken && refreshToken && userData) {
        setAuthState({
          user: JSON.parse(userData),
          accessToken,
          refreshToken,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

const login = async (data: LoginData) => {
  try {
    console.log('=== FIREBASE LOGIN ===');
    console.log('Email:', data.email);
    
    // Step 1: Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    console.log('Firebase sign-in successful, UID:', firebaseUser.uid);
    
    // Step 2: Get Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken();
    console.log('Got Firebase token');
    
    // Step 3: Send token to our backend
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/firebase-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firebase_token: firebaseToken }),
    });

    console.log('Backend response status:', response.status);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    }

    const result = JSON.parse(responseText);
    console.log('Backend login successful');

    // Store tokens
    const accessToken = result.access_token || result.accessToken;
    const refreshToken = result.refresh_token || result.refreshToken;
    const userData = result.user;

    if (!accessToken || !refreshToken || !userData) {
      throw new Error('Missing data in response');
    }

    await Promise.all([
      AsyncStorage.setItem('accessToken', accessToken),
      AsyncStorage.setItem('refreshToken', refreshToken),
      AsyncStorage.setItem('userData', JSON.stringify(userData)),
    ]);

    setAuthState({
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isLoading: false,
    });

    console.log('=== LOGIN SUCCESSFUL ===');
  } catch (error: any) {
    console.error('=== LOGIN ERROR ===', error);
    
    // Handle Firebase-specific errors
    let errorMessage = 'An error occurred during login';
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    Alert.alert('Login Error', errorMessage);
    throw new Error(errorMessage);
  }
};

  const register = async (data: RegisterData) => {
  try {
    console.log('=== FIREBASE REGISTER ===');
    console.log('Email:', data.email);
    
    // Step 1: Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const firebaseUser = userCredential.user;
    
    console.log('Firebase user created, UID:', firebaseUser.uid);
    
    // Step 2: Get Firebase ID token
    const firebaseToken = await firebaseUser.getIdToken();
    console.log('Got Firebase token');
    
    // Step 3: Send token to our backend to create user in our database
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/firebase-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        firebase_token: firebaseToken,
        full_name: data.full_name 
      }),
    });

    console.log('Backend response status:', response.status);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const result = JSON.parse(responseText);
    console.log('Backend registration successful');

    // Store tokens
    const accessToken = result.access_token || result.accessToken;
    const refreshToken = result.refresh_token || result.refreshToken;
    const userData = result.user;

    if (!accessToken || !refreshToken || !userData) {
      throw new Error('Missing data in response');
    }

    await Promise.all([
      AsyncStorage.setItem('accessToken', accessToken),
      AsyncStorage.setItem('refreshToken', refreshToken),
      AsyncStorage.setItem('userData', JSON.stringify(userData)),
    ]);

    setAuthState({
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isLoading: false,
    });

    console.log('=== REGISTRATION SUCCESSFUL ===');
  } catch (error: any) {
    console.error('=== REGISTER ERROR ===', error);
    
    // Handle Firebase-specific errors
    let errorMessage = 'An error occurred during registration';
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    Alert.alert('Registration Error', errorMessage);
    throw new Error(errorMessage);
  }
};

// In AuthContext.tsx - Update the logout function
const logout = async () => {
  try {
    // Sign out from Firebase
    try {
      await signOut(auth);
      console.log('Firebase sign-out successful');
    } catch (firebaseError) {
      console.log('Firebase sign-out failed (may already be signed out):', firebaseError);
    }
    
    // Call logout endpoint if token exists
    if (authState.accessToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.log('Logout API call failed (may be offline):', error);
        // Continue with local logout even if API fails
      }
    }
  } finally {
    // Clear local storage regardless
    await Promise.all([
      AsyncStorage.removeItem('accessToken'),
      AsyncStorage.removeItem('refreshToken'),
      AsyncStorage.removeItem('userData'),
    ]);
    
    // Reset auth state
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
    
    console.log('=== LOGOUT SUCCESSFUL ===');
  }
};

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      if (!authState.refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: authState.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      
      await AsyncStorage.setItem('accessToken', result.access_token);
      await AsyncStorage.setItem('refreshToken', result.refresh_token);
      
      setAuthState(prev => ({
        ...prev,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      }));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout(); // Logout if refresh fails
      return false;
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({ ...prev, user }));
    AsyncStorage.setItem('userData', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        refreshAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};