// src/components/Forum/PostDetailOverlay.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../hooks/useForum';
import { FontAwesome5 } from '@expo/vector-icons';
import EditPostScreen from '../screens/EditPostScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
};

interface PostDetailOverlayProps {
  visible: boolean;
  onClose: () => void;
  postId: string | null;
}

const PostDetailOverlay: React.FC<PostDetailOverlayProps> = ({ visible, onClose, postId }) => {
  const { authState } = useAuth();
  const { currentPost, fetchPost, addComment, toggleLike, deletePost } = useForum();

  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showEditScreen, setShowEditScreen] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadPost();
    }
  }, [visible, postId]);

  useEffect(() => {
    if (!showEditScreen && postId && visible) {
      loadPost();
    }
  }, [showEditScreen]);

  const loadPost = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      await fetchPost(postId);
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return;
    try {
      await addComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleToggleLike = async () => {
    if (!postId) return;
    try {
      await toggleLike(postId);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleDeletePost = () => {
    if (!postId) return;
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    if (isWeb) {
      const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
      if (confirmed) performDelete();
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const performDelete = async () => {
    if (!postId) return;
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
    try {
      await deletePost(postId);
      onClose();
      if (isWeb) window.alert('Post deleted successfully');
      else Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      if (isWeb) window.alert('Failed to delete post');
      else Alert.alert('Error', 'Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: any } = {
      diseases: { backgroundColor: '#fdecea', borderColor: COLORS.errorRed },
      treatment: { backgroundColor: '#e8f5ec', borderColor: COLORS.accentGreen },
      general: { backgroundColor: '#e8f0fe', borderColor: '#4a7ee8' },
      questions: { backgroundColor: '#fff8e1', borderColor: '#f59e0b' },
      success: { backgroundColor: '#ede9fe', borderColor: '#8b5cf6' },
    };
    return colors[category] || { backgroundColor: '#e8f0fe', borderColor: '#4a7ee8' };
  };

  const getCategoryTextColor = (category: string) => {
    const colors: { [key: string]: string } = {
      diseases: COLORS.errorRed,
      treatment: COLORS.accentGreen,
      general: '#4a7ee8',
      questions: '#f59e0b',
      success: '#8b5cf6',
    };
    return colors[category] || '#4a7ee8';
  };

  if (!visible) return null;

  const isAuthor = currentPost?.author_id === authState.user?.id;
  const isAdmin = authState.user?.role === 'admin';

  const images: string[] = Array.isArray(currentPost?.image_urls)
    ? currentPost.image_urls.flat().filter(url => typeof url === 'string')
    : (currentPost?.image_urls ? [currentPost.image_urls] : []);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerAccentDot} />
              <Text style={styles.headerTitle}>Post Details</Text>
            </View>
            <View style={styles.headerActions}>
              {(isAuthor || isAdmin) && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowOptions(!showOptions)}
                >
                  <FontAwesome5
                    name="ellipsis-h"
                    size={isSmallDevice ? 14 : 16}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                <FontAwesome5
                  name="times"
                  size={isSmallDevice ? 14 : 16}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Accent bar */}
          <View style={styles.headerAccentBar} />

          {/* ── Options Menu ───────────────────────────────────────────────── */}
          {showOptions && (
            <View style={styles.optionsMenu}>
              {isAuthor && (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setShowOptions(false);
                    setShowEditScreen(true);
                  }}
                >
                  <FontAwesome5 name="edit" size={13} color={COLORS.accentGreen} />
                  <Text style={styles.optionText}>Edit Post</Text>
                </TouchableOpacity>
              )}
              {(isAuthor || isAdmin) && (
                <TouchableOpacity
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={() => {
                    setShowOptions(false);
                    handleDeletePost();
                  }}
                >
                  <FontAwesome5 name="trash" size={13} color={COLORS.errorRed} />
                  <Text style={[styles.optionText, styles.deleteOptionText]}>Delete Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Loading / Error / Content ───────────────────────────────────── */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accentGreen} />
              <Text style={styles.loadingText}>Loading post...</Text>
            </View>
          ) : !currentPost ? (
            <View style={styles.errorContainer}>
              <FontAwesome5 name="exclamation-circle" size={36} color={COLORS.errorRed} />
              <Text style={styles.errorText}>Post not found</Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

              {/* ── Post Card ──────────────────────────────────────────────── */}
              <View style={styles.postCard}>

                {/* Author Row */}
                <View style={styles.authorContainer}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.authorInitial}>
                      {currentPost.author_name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>
                      {currentPost.author_name || 'Anonymous'}
                    </Text>
                    <View style={styles.postMeta}>
                      <FontAwesome5 name="clock" size={9} color={COLORS.textMuted} />
                      <Text style={styles.postTime}>{formatDate(currentPost.created_at)}</Text>
                      {currentPost.category && (
                        <View style={[styles.categoryTag, getCategoryColor(currentPost.category)]}>
                          <Text style={[styles.categoryText, { color: getCategoryTextColor(currentPost.category) }]}>
                            {currentPost.category}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.postTitle}>{currentPost.title}</Text>

                {/* Images */}
                {images.length > 0 && (
                  <View style={styles.imagesContainer}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(event) => {
                        const newIndex = Math.round(
                          event.nativeEvent.contentOffset.x /
                          (isSmallDevice ? SCREEN_WIDTH * 0.85 : SCREEN_WIDTH * 0.6)
                        );
                        setActiveImageIndex(newIndex);
                      }}
                      style={styles.imagesScrollView}
                    >
                      {images.map((imageUri, index) => (
                        <View key={index} style={styles.imageSlide}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.postImage}
                            resizeMode="contain"
                          />
                        </View>
                      ))}
                    </ScrollView>

                    {images.length > 1 && (
                      <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.paginationDot,
                              index === activeImageIndex && styles.paginationDotActive,
                            ]}
                          />
                        ))}
                      </View>
                    )}

                    <View style={styles.imageCountBadge}>
                      <FontAwesome5 name="images" size={isSmallDevice ? 9 : 11} color={COLORS.textLight} />
                      <Text style={styles.imageCountText}>
                        {images.length} {images.length === 1 ? 'image' : 'images'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Description */}
                <Text style={styles.postContent}>{currentPost.description}</Text>

                {/* Stats Row */}
                <View style={styles.postStats}>
                  <View style={styles.statsItem}>
                    <FontAwesome5 name="thumbs-up" size={isSmallDevice ? 13 : 14} color={COLORS.accentGreen} />
                    <Text style={styles.statsText}>{currentPost.likes_count} Likes</Text>
                  </View>
                  <View style={styles.statsItem}>
                    <FontAwesome5 name="comment" size={isSmallDevice ? 13 : 14} color={COLORS.medGreen} />
                    <Text style={styles.statsText}>{currentPost.comments_count} Comments</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, currentPost.user_has_liked && styles.likedButton]}
                    onPress={handleToggleLike}
                  >
                    <FontAwesome5
                      name="thumbs-up"
                      size={isSmallDevice ? 13 : 14}
                      color={currentPost.user_has_liked ? COLORS.textLight : COLORS.accentGreen}
                    />
                    <Text style={[
                      styles.actionButtonText,
                      currentPost.user_has_liked && styles.likedButtonText,
                    ]}>
                      Like
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome5 name="comment" size={isSmallDevice ? 13 : 14} color={COLORS.accentGreen} />
                    <Text style={styles.actionButtonText}>Comment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome5 name="share" size={isSmallDevice ? 13 : 14} color={COLORS.accentGreen} />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome5 name="bookmark" size={isSmallDevice ? 13 : 14} color={COLORS.accentGreen} />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Comments Section ───────────────────────────────────────── */}
              <View style={styles.commentsContainer}>
                <View style={styles.commentsTitleRow}>
                  <View style={styles.sectionAccent} />
                  <Text style={styles.commentsTitle}>
                    Comments ({currentPost.comments?.length || 0})
                  </Text>
                </View>

                {/* Add Comment */}
                <View style={styles.addCommentContainer}>
                  <View style={styles.commentInputAvatar}>
                    <Text style={styles.commentInputInitial}>
                      {authState.user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.commentInputWrapper}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write a comment..."
                      placeholderTextColor={COLORS.textMuted}
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                      onPress={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <FontAwesome5
                        name="paper-plane"
                        size={isSmallDevice ? 12 : 14}
                        color={COLORS.textLight}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Comments List */}
                {currentPost.comments?.length === 0 ? (
                  <View style={styles.noComments}>
                    <View style={styles.noCommentsIcon}>
                      <FontAwesome5
                        name="comment-slash"
                        size={isSmallDevice ? 28 : 32}
                        color={COLORS.accentGreen}
                      />
                    </View>
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                    <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
                  </View>
                ) : (
                  currentPost.comments?.map(comment => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarInitial}>
                          {comment.user_name?.[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{comment.user_name}</Text>
                          <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                        </View>
                        <Text style={styles.commentText}>{comment.comment}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}

          {/* Edit Post Screen Modal */}
          {showEditScreen && currentPost && (
            <EditPostScreen
              setActiveTab={() => setShowEditScreen(false)}
              postId={postId!}
              initialData={{
                title: currentPost.title,
                description: currentPost.description,
                category: currentPost.category,
                image_urls: currentPost.image_urls || [],
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ── Overlay & Container ────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: isSmallDevice ? 'flex-end' : 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 0 : 20,
  },
  container: {
    width: '100%',
    maxWidth: isSmallDevice ? '100%' : 860,
    height: isSmallDevice ? SCREEN_HEIGHT * 0.93 : undefined,
    maxHeight: isSmallDevice ? undefined : '90%',
    backgroundColor: COLORS.bgCream,
    borderRadius: isSmallDevice ? 20 : 16,
    borderBottomLeftRadius: isSmallDevice ? 0 : 16,
    borderBottomRightRadius: isSmallDevice ? 0 : 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.medGreen,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 14 : 20,
    paddingVertical: isSmallDevice ? 14 : 16,
    backgroundColor: COLORS.darkGreen,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAccentDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.limeglow,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 15 : 18,
    fontWeight: '700',
    color: COLORS.textLight,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  iconButton: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: COLORS.accentGreen,
  },

  // ── Options Menu ──────────────────────────────────────────────────────────
  optionsMenu: {
    position: 'absolute',
    top: isSmallDevice ? 62 : 72,
    right: isSmallDevice ? 14 : 20,
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    paddingVertical: 6,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    gap: 10,
  },
  optionText: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '500',
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: COLORS.bgLight,
  },
  deleteOptionText: {
    color: COLORS.errorRed,
  },

  // ── Loading / Error ───────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 13 : 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '600',
  },

  // ── Post Card ─────────────────────────────────────────────────────────────
  content: {
    flex: 1,
  },
  postCard: {
    backgroundColor: COLORS.textLight,
    padding: isSmallDevice ? 14 : 20,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.bgLight,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 12 : 14,
    gap: 10,
  },
  authorAvatar: {
    width: isSmallDevice ? 38 : 48,
    height: isSmallDevice ? 38 : 48,
    borderRadius: isSmallDevice ? 11 : 14,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  authorInitial: {
    fontSize: isSmallDevice ? 15 : 18,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  postTime: {
    fontSize: isSmallDevice ? 10 : 11,
    color: COLORS.textMuted,
  },
  categoryTag: {
    paddingHorizontal: isSmallDevice ? 7 : 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  postTitle: {
    fontSize: isSmallDevice ? 18 : 24,
    fontWeight: '700',
    color: COLORS.darkGreen,
    marginBottom: isSmallDevice ? 12 : 16,
    fontStyle: 'italic',
    lineHeight: isSmallDevice ? 24 : 32,
  },

  // ── Images ────────────────────────────────────────────────────────────────
  imagesContainer: {
    marginBottom: isSmallDevice ? 12 : 16,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bgLight,
  },
  imagesScrollView: {
    height: isSmallDevice ? 220 : 280,
  },
  imageSlide: {
    width: isSmallDevice ? SCREEN_WIDTH * 0.85 : SCREEN_WIDTH * 0.6,
    height: isSmallDevice ? 220 : 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    borderRadius: 4,
    backgroundColor: 'rgba(26,58,42,0.35)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.darkGreen,
    width: isSmallDevice ? 8 : 10,
    height: isSmallDevice ? 8 : 10,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,58,42,0.75)',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: 10,
    gap: 5,
  },
  imageCountText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
  },

  // ── Post Body ─────────────────────────────────────────────────────────────
  postContent: {
    fontSize: isSmallDevice ? 13 : 15,
    color: COLORS.textMuted,
    lineHeight: isSmallDevice ? 20 : 24,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 16 : 24,
    paddingVertical: isSmallDevice ? 10 : 14,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.bgLight,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.bgLight,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: isSmallDevice ? 10 : 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 5 : 7,
    paddingVertical: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
    backgroundColor: COLORS.bgCream,
  },
  likedButton: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreen,
  },
  actionButtonText: {
    color: COLORS.accentGreen,
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '600',
  },
  likedButtonText: {
    color: COLORS.textLight,
  },

  // ── Comments ──────────────────────────────────────────────────────────────
  commentsContainer: {
    backgroundColor: COLORS.bgCream,
    padding: isSmallDevice ? 14 : 20,
  },
  commentsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.accentGreen,
  },
  commentsTitle: {
    fontSize: isSmallDevice ? 15 : 18,
    fontWeight: '700',
    color: COLORS.textDark,
    fontStyle: 'italic',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  commentInputAvatar: {
    width: isSmallDevice ? 32 : 38,
    height: isSmallDevice ? 32 : 38,
    borderRadius: isSmallDevice ? 9 : 11,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },
  commentInputInitial: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderWidth: 1.5,
    borderColor: COLORS.medGreen,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 13 : 14,
    maxHeight: 100,
    paddingVertical: 2,
  },
  sendButton: {
    width: isSmallDevice ? 30 : 34,
    height: isSmallDevice ? 30 : 34,
    borderRadius: 9,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.bgLight,
    opacity: 0.5,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 30 : 40,
    gap: 8,
  },
  noCommentsIcon: {
    width: isSmallDevice ? 60 : 70,
    height: isSmallDevice ? 60 : 70,
    borderRadius: isSmallDevice ? 30 : 35,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  noCommentsText: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '700',
  },
  noCommentsSubtext: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    gap: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 12 : 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  commentAvatar: {
    width: isSmallDevice ? 30 : 36,
    height: isSmallDevice ? 30 : 36,
    borderRadius: isSmallDevice ? 9 : 10,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },
  commentAvatarInitial: {
    fontSize: isSmallDevice ? 11 : 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
  },
  commentTime: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 9 : 10,
  },
  commentText: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 18 : 20,
  },
});

export default PostDetailOverlay;