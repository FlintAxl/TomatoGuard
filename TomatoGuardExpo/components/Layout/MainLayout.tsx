import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52',
  textLight: '#ffffff',
  textDark: '#0d1f14',
  textMuted: '#5a7a65',
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
};  

interface MainLayoutProps {
  drawerOpen: boolean;
  drawerAnimation: Animated.Value;
  pageTitle: string;
  pageSubtitle: string;
  userEmail?: string;
  onMenuPress: () => void;
  onCloseDrawer: () => void;
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
  children,
}) => {

  return (
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar style="light" />

      {/* Main Content */}
        {/* Header with Glass Effect */}
        <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              {/* Left Section: Menu Button + Logo */}
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                  <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                
                {/* Logo - Hidden on mobile to save space */}
                {SCREEN_WIDTH >= 768 && (
                  <View style={styles.logoContainer}>
                    <Image style={styles.logoPlaceholder} source={require('./../../assets/logo.png')} /> 
                  </View>
                )}
              </View>

              {/* Center Section: Title */}
              <View style={styles.headerCenter}>
                <View style={styles.titleRow}>
                  <Text style={styles.pageTitle}>
                    {pageTitle}
                  </Text>
                  {SCREEN_WIDTH >= 768 && (
                    <Text style={styles.titleDash}>
                      -
                    </Text>
                  )}
                  <Text style={styles.pageSubtitle}>
                    {pageSubtitle}
                  </Text>
                </View>
              </View>

              {/* Right Section: User Email */}
              {userEmail && (
                <View style={styles.headerRight}>
                  {/* User Avatar */}
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarPlaceholder}>👤</Text>
                  </View>
                  {/* Email - Hidden on mobile */}
                  {SCREEN_WIDTH >= 768 && (
                    <Text style={styles.userEmail}>
                      {userEmail}
                    </Text>
                  )}
                </View>
              )}
            </View>
        </View>
        {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Header styles
  headerContainer: {
    margin: SCREEN_WIDTH < 768 ? 8 : 16,
    borderRadius: SCREEN_WIDTH < 768 ? 12 : 16,
    overflow: 'hidden',
    backgroundColor: COLORS.darkGreen,
    paddingVertical: SCREEN_WIDTH < 768 ? 12 : 16,
    paddingHorizontal: SCREEN_WIDTH < 768 ? 12 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SCREEN_WIDTH < 768 ? 8 : 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH < 768 ? 8 : 12,
  },
  menuButton: {
    width: SCREEN_WIDTH < 768 ? 36 : 40,
    height: SCREEN_WIDTH < 768 ? 36 : 40,
    borderRadius: SCREEN_WIDTH < 768 ? 8 : 10,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: SCREEN_WIDTH < 768 ? 18 : 20,
    color: '#0f172a',
    fontWeight: '600',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    color: '#ffffff',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: SCREEN_WIDTH < 768 ? 8 : 16,
    alignItems: SCREEN_WIDTH < 768 ? 'flex-start' : 'center',
  },
  titleRow: {
    flexDirection: SCREEN_WIDTH < 768 ? 'column' : 'row',
    alignItems: SCREEN_WIDTH < 768 ? 'flex-start' : 'center',
    gap: SCREEN_WIDTH < 768 ? 2 : 0,
  },
  pageTitle: {
    fontSize: SCREEN_WIDTH < 768 ? 14 : 18,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
  },
  titleDash: {
    fontSize: 18,
    color: 'white',
    marginHorizontal: 8,
  },
  pageSubtitle: {
    fontSize: SCREEN_WIDTH < 768 ? 12 : 18,
    color: 'white',
    fontWeight: SCREEN_WIDTH < 768 ? '400' : 'normal',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH < 768 ? 0 : 8,
  },
  userAvatar: {
    width: SCREEN_WIDTH < 768 ? 36 : 40,
    height: SCREEN_WIDTH < 768 ? 36 : 40,
    borderRadius: SCREEN_WIDTH < 768 ? 12 : 16,
    backgroundColor: '#2d7736',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarPlaceholder: {
    fontSize: SCREEN_WIDTH < 768 ? 12 : 14,
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    padding: 10,
  },
});

export default MainLayout;