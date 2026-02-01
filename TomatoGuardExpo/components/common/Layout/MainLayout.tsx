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
  const styles = appStyles;

  return (
    <SafeAreaView style={{ flex: 1}}>
      <StatusBar style="light" />

      {/* Main Content */}
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
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