import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationItem } from '../services/api/notificationService';
import { RootStackNavigationProp } from '../navigation/types';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    forumNotifications,
    forumUnreadCount,
    markForumNotificationRead,
    markAllForumNotificationsRead,
  } = useNotification();

  const handleNotificationPress = async (item: NotificationItem) => {
    // Mark as read
    if (!item.is_read) {
      await markForumNotificationRead(item.id);
    }

    // Close panel and navigate to the post
    onClose();
    if (item.post_id) {
      navigation.navigate('Main', {
        screen: 'PostDetail',
        params: { postId: item.post_id },
      });
    }
  };

  const handleMarkAllRead = async () => {
    await markAllForumNotificationsRead();
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      {/* Unread indicator dot */}
      {!item.is_read && <View style={styles.unreadDot} />}

      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.notificationIcon}>📝</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            <Text style={styles.authorName}>{item.author_name}</Text>
            {' posted in the forum'}
          </Text>
          {item.post_title && (
            <Text style={styles.postTitle} numberOfLines={1}>
              "{item.post_title}"
            </Text>
          )}
          <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll be notified when someone posts in the forum
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.panelContainer}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {forumUnreadCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {forumUnreadCount > 99 ? '99+' : forumUnreadCount}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerRight}>
              {forumUnreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification List */}
          <FlatList
            data={forumNotifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={
              forumNotifications.length === 0 ? styles.emptyListContent : undefined
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  panelContainer: {
    marginTop: Platform.OS === 'web' ? 60 : 80,
    marginHorizontal: isSmallDevice ? 12 : SCREEN_WIDTH * 0.2,
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unreadItem: {
    backgroundColor: '#f0fdf4',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 8,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  authorName: {
    fontWeight: '700',
    color: '#111827',
  },
  postTitle: {
    fontSize: 13,
    color: '#2d7736',
    fontWeight: '500',
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default NotificationPanel;
