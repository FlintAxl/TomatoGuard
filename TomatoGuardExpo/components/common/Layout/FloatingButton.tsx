// src/components/common/Layout/FloatingButton.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';
import Chatbot from '../../Chatbot';

interface FloatingActionButtonProps {
  onItemPress: (itemId: string) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onItemPress }) => {
  const [open, setOpen] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const navigation = useNavigation<RootStackNavigationProp>();

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

  return (
    <>
      <FAB.Group
        open={open}
        visible
        icon={open ? 'close' : 'plus'}
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
            icon: 'robot',
            label: 'Ask TomaBot',
            onPress: handleOpenChatbot,
            color: '#ffffff',
            style: styles.actionButton,
            labelStyle: styles.actionLabel,
          },
        ]}
        onStateChange={({ open }) => setOpen(open)}
        fabStyle={styles.fab}
        color="#ffffff"
        style={styles.fabGroup}
      />

      {/* Chatbot Modal */}
      <Chatbot 
        visible={chatbotVisible} 
        onClose={() => setChatbotVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  fabGroup: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1001,
  },
  fab: {
    backgroundColor: '#e9523a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#2d7736',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FloatingActionButton;