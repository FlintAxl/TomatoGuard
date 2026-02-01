import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { appStyles } from '../../../styles';
import { useAuth } from '../../../contexts/AuthContext';

interface DrawerProps {
  activeTab: string;
  onItemPress: (itemId: string) => void;
  animation: Animated.Value;
  drawerOpen: boolean;  // Add this
}

const Drawer: React.FC<DrawerProps> = ({ activeTab, onItemPress, animation, drawerOpen }) => {
  const styles = appStyles;
  const { authState } = useAuth();
  
  const baseNavItems = [
    { id: 'camera', label: 'Camera Capture', icon: 'camera' },
    { id: 'forums', label: 'Forums', icon: 'info-circle' },
    { id: 'blogs', label: 'Blogs', icon: 'pen' },
    { id: 'upload', label: 'Upload Images', icon: 'folder-open' },
    { id: 'results', label: 'Analysis Results', icon: 'chart-bar' },
    { id: 'about', label: 'About System', icon: 'info-circle' },
    { id: 'profile', label: 'My Profile', icon: 'user' },
    { id: 'logout', label: 'Logout', icon: 'sign-out-alt' },
    { id: 'landingpage', label: 'Landing', icon: 'chart-bar' },
  ];  

  // Add admin option if user is admin
  const navItems = authState.user?.role === 'admin' 
    ? [
      { id: 'admin', label: 'Admin Dashboard', icon: 'cog' },
        ...baseNavItems
      ]
    : baseNavItems;

  return (
    <>
      <View style={styles.sidebarHeader}>
        <View style={styles.sidebarHeaderTop}>
          {drawerOpen ? (
            <View>
              <Text style={styles.logo}>TomatoGuard</Text>
              <Text style={styles.logoSubtitle}>PLANT DISEASE DETECTION SYSTEM</Text>
            </View>
          ) : (
            <Animated.Image
              source={require('../../../assets/favicon.png')}
              style={styles.logoImage}
            />
          )}
        </View>
      </View>
      <Animated.View
        style={[
          styles.navMenu,
          {
            width: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [70, 260],
            }),
          },
        ]}
      >
        <ScrollView>
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
      </Animated.View>
    </>
  );
};

export default Drawer;