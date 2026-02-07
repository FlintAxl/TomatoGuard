import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppScreen from '../screens/MainAppScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import LandingPageScreen from '../screens/LandingScreen'
import { MainStackParamList } from './types';
// ForumScreen, CreatePostScreen, and PostDetailScreen are now rendered within MainAppScreen
// to keep the drawer accessible across all forum-related screens
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={MainAppScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;