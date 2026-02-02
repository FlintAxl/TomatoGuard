import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDrawer } from '../hooks/useDrawer';
import Drawer from '../components/common/Drawer/Drawer';
import AdminLayout from '../components/common/Layout/AdminLayout';
import { MainStackNavigationProp, RootStackNavigationProp } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

const AdminDashboardScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const mainNavigation = useNavigation<MainStackNavigationProp>();
  const { authState } = useAuth();
  const { drawerOpen, drawerAnimation, toggleDrawer, closeDrawer } = useDrawer();

  const handleNavItemPress = (itemId: string) => {
    if (itemId === 'logout') {
      // Handle logout
      return;
    }
    if (itemId === 'profile') {
      mainNavigation.navigate('Profile');
      return;
    }
    if (itemId === 'admin') {
      // Already on admin dashboard, just close drawer
      closeDrawer();
      return;
    }
    // Navigate back to MainApp for other items
    mainNavigation.navigate('MainApp');
    closeDrawer();
  };

  return (
    <AdminLayout
      drawerOpen={drawerOpen}
      drawerAnimation={drawerAnimation}
      pageTitle="Admin Dashboard"
      pageSubtitle="System administration and management"
      userEmail={authState.user?.email?.split('@')[0]}
      onMenuPress={toggleDrawer}
      onCloseDrawer={closeDrawer}
      drawerComponent={
        <Drawer
          activeTab="admin"
          onItemPress={handleNavItemPress}
          animation={drawerAnimation}
          drawerOpen={drawerOpen}
          onClose={closeDrawer}
        />
      }
    >
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            Admin Dashboard
          </Text>
          <Text style={{ fontSize: 16, color: '#666' }}>
            Welcome to the admin panel. Manage users and system settings here.
          </Text>
        </View>

        <View style={{ 
          backgroundColor: '#f5f5f5', 
          padding: 20, 
          borderRadius: 10,
          marginBottom: 20 
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Admin Functions
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            • User management{'\n'}
            • System analytics{'\n'}
            • Content moderation{'\n'}
            • Settings configuration
          </Text>
        </View>

        <View style={{ 
          backgroundColor: '#e8f4fd', 
          padding: 20, 
          borderRadius: 10 
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            System Status
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            All systems operational
          </Text>
        </View>
      </ScrollView>
    </AdminLayout>
  );
};

export default AdminDashboardScreen;
