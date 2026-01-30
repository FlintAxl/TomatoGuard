// TomatoGuardExpo/src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  full_name?: string;
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
    console.log('=== LOGIN DEBUG ===');
    console.log('API URL:', API_BASE_URL);
    console.log('Request data:', data);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Read response as text first to see what we get
    const responseText = await response.text();
    console.log('Response text (first 500 chars):', responseText.substring(0, 500));
    
    if (!response.ok) {
      console.error('Response not OK, full text:', responseText);
      // Try to parse as JSON if possible
      if (contentType && contentType.includes('application/json')) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      } else {
        // It's HTML or some other format
        throw new Error(`Server returned ${response.status}: ${responseText.substring(0, 100)}`);
      }
    }

    // Parse successful response
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed JSON result:', result);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error('Invalid JSON response from server');
    }
    

    // DEBUG: Check token field names
console.log('Available fields in result:', Object.keys(result));

// Store tokens - check for different field names
const accessToken = result.access_token || result.accessToken;
const refreshToken = result.refresh_token || result.refreshToken;
const tokenType = result.token_type || result.tokenType;
const userData = result.user; // Get user from response

console.log('Found accessToken:', accessToken ? 'Yes' : 'No');
console.log('Found refreshToken:', refreshToken ? 'Yes' : 'No');
console.log('Found tokenType:', tokenType);
console.log('Found userData:', userData ? 'Yes' : 'No');

if (!accessToken || !refreshToken || !userData) {
  throw new Error('Missing data in response');
}

// Store tokens and user data
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
    Alert.alert('Login Error', error.message || 'An error occurred during login');
    throw error;
  }
};

  const register = async (data: RegisterData) => {
  try {
    console.log('=== REGISTER DEBUG ===');
    console.log('API URL:', API_BASE_URL);
    console.log('Request data:', { ...data, password: '[HIDDEN]' });
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Read as text first
    const responseText = await response.text();
    console.log('Response text:', responseText.substring(0, 500));
    
    if (!response.ok) {
      console.error('Registration failed, full response:', responseText);
      if (contentType && contentType.includes('application/json')) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    console.log('Registration successful, attempting auto-login...');
    
    // Auto-login after successful registration
    await login({
      email: data.email,
      password: data.password,
    });
    
  } catch (error: any) {
    console.error('=== REGISTER ERROR ===', error);
    Alert.alert('Registration Error', error.message || 'An error occurred during registration');
    throw error;
  }
};

// In AuthContext.tsx - Update the logout function
const logout = async () => {
  try {
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