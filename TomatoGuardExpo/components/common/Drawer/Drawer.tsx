import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { appStyles } from '../../../styles';
import { useAuth } from '../../../contexts/AuthContext';

interface DrawerProps {
  activeTab: string;
  onItemPress: (itemId: string) => void;
  animation: Animated.Value;
}

const Drawer: React.FC<DrawerProps> = ({ activeTab, onItemPress, animation }) => {
  const styles = appStyles;
  const { authState } = useAuth();
  
  const baseNavItems = [
    { id: 'camera', label: 'Camera Capture', icon: '📷' },
    { id: 'upload', label: 'Upload Images', icon: '📁' },
    { id: 'results', label: 'Analysis Results', icon: '📊' },
    { id: 'about', label: 'About System', icon: 'ℹ️' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'logout', label: 'Logout', icon: '🚪' },
  ];

  // Add admin option if user is admin
  const navItems = authState.user?.role === 'admin' 
    ? [
        { id: 'admin', label: 'Admin Dashboard', icon: '⚙️' },
        ...baseNavItems
      ]
    : baseNavItems;

  return (
    <>
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderTop}>
          <Animated.View style={{ opacity: animation }}>
            <Text style={styles.logo}>TomatoGuard</Text>
          </Animated.View>
        </View>
        <Animated.View style={{ opacity: animation }}>
          <Text style={styles.logoSubtitle}>PLANT DISEASE DETECTION SYSTEM</Text>
        </Animated.View>
      </View>
      
      <Animated.View style={[styles.navMenu, { opacity: animation }]}>
        <ScrollView>
          {navItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
              onPress={() => onItemPress(item.id)}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navText, activeTab === item.id && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default Drawer;