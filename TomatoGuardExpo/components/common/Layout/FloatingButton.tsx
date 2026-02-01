// src/components/common/FAB/FloatingActionButton.tsx
import React, { useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { FAB } from 'react-native-paper';

interface FloatingActionButtonProps {
  onItemPress: (itemId: string) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onItemPress }) => {
  const [open, setOpen] = useState(false);

  return (
    <FAB.Group
      open={open}
      visible
      icon={open ? 'close' : 'plus'}
      actions={[
        {
          icon: 'camera',
          label: 'Camera Capture',
          onPress: () => onItemPress('camera'),
          color: '#ffffff',
          style: styles.actionButton,
          labelStyle: styles.actionLabel,
        },
        {
          icon: 'image',
          label: 'Upload Images',
          onPress: () => onItemPress('upload'),
          color: '#ffffff',
          style: styles.actionButton,
          labelStyle: styles.actionLabel,
        },
        {
          icon: 'chart-bar',
          label: 'View Results',
          onPress: () => onItemPress('results'),
          color: '#ffffff',
          style: styles.actionButton,
          labelStyle: styles.actionLabel,
        },
        {
          icon: 'forum',
          label: 'Forums',
          onPress: () => onItemPress('forums'),
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
  );
};

const styles = StyleSheet.create({
  fabGroup: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1001, // Above drawer
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
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FloatingActionButton;