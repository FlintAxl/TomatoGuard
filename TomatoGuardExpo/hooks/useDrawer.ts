import { useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';

export const useDrawer = () => {
  const [drawerOpen, setDrawerOpen] = useState(Platform.OS === 'web');
  const drawerAnimation = useRef(new Animated.Value(Platform.OS === 'web' ? 1 : 0)).current;

  const toggleDrawer = () => {
    const toValue = drawerOpen ? 0 : 1;
    setDrawerOpen(!drawerOpen);
    
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    if (drawerOpen) {
      setDrawerOpen(false);
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  return {
    drawerOpen,
    drawerAnimation,
    toggleDrawer,
    closeDrawer,
  };
};