import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LandingScreen from '../screens/LandingScreen';
const Stack = createNativeStackNavigator();

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
    // AUTHENTICATED: Show Main screen directly
    <Stack.Screen name="Main" component={MainNavigator} />
  ) : (
    // NOT AUTHENTICATED: Show Landing screen first
    <>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </>
  )}
</Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;