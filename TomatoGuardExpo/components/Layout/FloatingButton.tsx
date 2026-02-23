// src/components/common/Layout/FloatingButton.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';
import { useNotification } from '../../contexts/NotificationContext';
import Chatbot from '../Chatbot';
import UserAnalysisHistory from '../UserAnalysisHistory';

interface FloatingActionButtonProps {
  onItemPress: (itemId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onItemPress }) => {
  const [open, setOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>();
  const { hasNewAnalysis, newAnalysisCount } = useNotification();

  const handleNavigation = (tab: string) => {
    setOpen(false);
    navigation.navigate('Main', {
      screen: 'MainApp',
      params: { initialTab: tab }
    });
  };

  const handleOpenChatbot = () => {
    setOpen(false);
    setChatbotVisible(true);
  };

  const handleOpenHistory = () => {
    setOpen(false);
    setHistoryVisible(true);
  };

  // Determine the FAB icon: bell when notifications exist, plus otherwise
  const getFabIcon = () => {
    if (open) return 'close';
    if (hasNewAnalysis) return 'bell';
    return 'plus';
  };

  return (
    <>
      {/* Notification Badge on FAB */}
      {hasNewAnalysis && !open && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {newAnalysisCount > 99 ? '99+' : newAnalysisCount}
            </Text>
          </View>
        </View>
      )}

      <FAB.Group
        open={open}
        visible
        backdropColor='rgba(0, 0, 0, 0.5)'
        icon={getFabIcon()}
        actions={[
          {
            icon: 'camera',
            label: 'Camera Capture',
            onPress: () => handleNavigation('camera'),
            color: '#ffffff',
            style: styles.actionButton,
            labelStyle: styles.actionLabel,
          },
          {
            icon: 'image',
            label: 'Upload Images',
            onPress: () => handleNavigation('upload'),
            color: '#ffffff',
            style: styles.actionButton,
            labelStyle: styles.actionLabel,
          },
          {
            icon: 'chart-bar',
            label: 'View Results',
            onPress: () => handleNavigation('results'),
            color: '#ffffff',
            style: styles.actionButton,
            labelStyle: styles.actionLabel,
          },
          {
            icon: 'history',
            label: hasNewAnalysis ? `Analysis History (${newAnalysisCount})` : 'Analysis History',
            onPress: handleOpenHistory,
            color: '#ffffff',
            style: hasNewAnalysis ? styles.actionButtonWithBadge : styles.actionButton,
            labelStyle: hasNewAnalysis ? styles.actionLabelWithBadge : styles.actionLabel,
          },
          {
            icon: 'robot',
            label: 'Ask TomaBot',
            onPress: handleOpenChatbot,
            color: '#ffffff',
            style: styles.actionButton,
            labelStyle: styles.actionLabel,
          },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        fabStyle={hasNewAnalysis && !open ? styles.fabWithNotification : styles.fab}
        color="#ffffff"
        style={styles.fabGroup}
      />

      {/* Chatbot Modal */}
      <Chatbot 
        visible={chatbotVisible} 
        onClose={() => setChatbotVisible(false)} 
      />

      {/* User Analysis History Modal */}
      <UserAnalysisHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fabGroup: {
    position: 'absolute',
    bottom: isSmallDevice ? 2 : 16,
    right: isSmallDevice ? 2 : 16,
    zIndex: 1001,
  },
  fab: {
    backgroundColor: '#2d7736',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabWithNotification: {
    backgroundColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    zIndex: 1002,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  actionButton: {
    backgroundColor: '#2d7736',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabel: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonWithBadge: {
    backgroundColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  actionLabelWithBadge: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default FloatingActionButton;