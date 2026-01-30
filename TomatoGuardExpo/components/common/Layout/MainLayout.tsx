import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { appStyles } from '../../../styles';

interface MainLayoutProps {
  drawerOpen: boolean;
  drawerAnimation: Animated.Value;
  pageTitle: string;
  pageSubtitle: string;
  userEmail?: string;
  onMenuPress: () => void;
  onCloseDrawer: () => void;
  drawerComponent: React.ReactNode;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  drawerOpen,
  drawerAnimation,
  pageTitle,
  pageSubtitle,
  userEmail,
  onMenuPress,
  onCloseDrawer,
  drawerComponent,
  children,
}) => {
  const styles = appStyles;
  const { width } = Dimensions.get('window');
  const SIDEBAR_WIDTH = 280;
  const COLLAPSED_WIDTH = 0;

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const drawerWidth = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, SIDEBAR_WIDTH],
  });

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Drawer Overlay */}
      {Platform.OS !== 'web' && drawerOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={onCloseDrawer}
        >
          <Animated.View
            style={[
              styles.drawerOverlayBg,
              { opacity: overlayOpacity }
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Drawer Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: Platform.OS === 'web' ? drawerWidth : SIDEBAR_WIDTH,
            transform: Platform.OS === 'web' ? [] : [{ translateX: drawerTranslateX }],
            position: Platform.OS === 'web' ? 'relative' : 'absolute',
            height: '100%',
            zIndex: 1000,
            overflow: 'hidden',
          }
        ]}
      >
        {drawerComponent}
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <View style={styles.topBarHeader}>
            <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.topBarTitleContainer}>
              <Text style={styles.pageTitle}>{pageTitle}</Text>
              <Text style={styles.pageSubtitle}>{pageSubtitle}</Text>
            </View>
            {userEmail && (
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                {userEmail}
              </Text>
            )}
          </View>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default MainLayout;