// TomatoGuardExpo/src/components/ProtectedRoute.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { protectedStyles } from '../styles';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <View style={protectedStyles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Loading...</Text>
      </View>
    );
  }

  if (!authState.user || !authState.accessToken) {
    return (
      <View style={protectedStyles.container}>
        <Text style={protectedStyles.title}>🔒 Access Required</Text>
        <Text style={protectedStyles.message}>
          Please sign in to access this feature
        </Text>
      </View>
    );
  }

  if (!authState.user.is_active) {
    return (
      <View style={protectedStyles.container}>
        <Text style={protectedStyles.title}>⚠️ Account Inactive</Text>
        <Text style={protectedStyles.message}>
          Your account has been deactivated. Please contact support.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;