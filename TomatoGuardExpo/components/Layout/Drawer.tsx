import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';

interface DrawerProps {
  activeTab: string;
  onItemPress: (itemId: string) => void;
  animation: Animated.Value;
  drawerOpen: boolean;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ 
  activeTab, 
  onItemPress, 
  animation, 
  drawerOpen,
  onClose 
}) => {
  const { authState } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  
  const baseNavItems = [
    { id: 'forums', label: 'Forums', icon: 'comments' },
    { id: 'blogs', label: 'Blogs', icon: 'pen' },
    { id: 'about', label: 'About System', icon: 'info-circle' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
    { id: 'logout', label: 'Logout', icon: 'sign-out-alt' },
  ];  

  // Add admin option if user is admin
  const navItems = authState.user?.role === 'admin' 
    ? [
        { id: 'admin', label: 'Admin Dashboard', icon: 'cog' },
        ...baseNavItems
      ]
    : baseNavItems;

  const drawerWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 260],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* Overlay Background - Visible when drawer is open */}
      {drawerOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
      )}

      {/* Drawer Container */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            width: drawerWidth,
            transform: [
              {
                translateX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-260, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Glass effect container */}
        <View style={styles.glassContainer}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <View style={styles.sidebarHeaderTop}>
              {drawerOpen ? (
                <View>
                  <Text style={styles.logo}>TomatoGuard</Text>
                  <Text style={styles.logoSubtitle}>PLANT DISEASE DETECTION SYSTEM</Text>
                </View>
              ) : (
                <Animated.Image
                  source={require('../../assets/favicon.png')}
                  style={styles.logoImage}
                />
              )}
            </View>
          </View>

          {/* Navigation Menu */}
          <ScrollView style={styles.navMenu} showsVerticalScrollIndicator={false}>
            {navItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
                onPress={() => onItemPress(item.id)}
              >
                <FontAwesome5
                  name={item.icon}
                  size={18}
                  style={styles.navIcon}
                  color={activeTab === item.id ? '#16a34a' : '#e9e9e9'}
                />
                {drawerOpen && (
                  <Animated.Text
                    style={[
                      styles.navText,
                      activeTab === item.id && styles.navTextActive,
                      {
                        opacity: animation,
                        transform: [
                          {
                            translateX: animation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {item.label}
                  </Animated.Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 998,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  glassContainer: {
    flex: 1,
    backgroundColor: Platform.select({
      web: 'rgba(30, 41, 59, 0.95)',
      default: 'rgba(30, 41, 59, 0.98)',
    }),
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }),
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    fontFamily: 'System',
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  navMenu: {
    flex: 1,
    padding: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  navText: {
    fontSize: 15,
    color: '#cbd5e1',
    fontWeight: '500',
    fontFamily: 'System',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default Drawer;