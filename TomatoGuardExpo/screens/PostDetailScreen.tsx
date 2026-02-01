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
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../hooks/useForum';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  faArrowLeft,
  faThumbsUp,
  faThumbsDown,
  faComment,
  faShare,
  faBookmark,
  faFlag,
  faUser,
  faPaperPlane,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';

interface PostDetailScreenProps {
  setActiveTab: (tab: string) => void;
  postId: string | null;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ setActiveTab, postId }) => {
  const navigation = useNavigation();
  const { authState } = useAuth();
  const { currentPost, fetchPost, addComment, toggleLike, deletePost } = useForum();
  
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      await fetchPost(postId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load post');
      setActiveTab('forum');
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
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              setActiveTab('forum');
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const handleReportPost = () => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => reportPost('spam') },
        { text: 'Inappropriate', onPress: () => reportPost('inappropriate') },
        { text: 'Harassment', onPress: () => reportPost('harassment') },
      ]
    );
  };

  const reportPost = (reason: string) => {
    // Implement report functionality
    Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
    setShowOptions(false);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </SafeAreaView>
    );
  }

  if (!currentPost) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
       <TouchableOpacity onPress={() => setActiveTab('forum')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isAuthor = currentPost.author_id === authState.user?.id;
  const isAdmin = authState.user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveTab('forum')}
        >
          <FontAwesome5 icon={faArrowLeft} size={20} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Post Details</Text>
        
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => setShowOptions(!showOptions)}
        >
          <FontAwesome5 icon={faEllipsisH} size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {showOptions && (
        <View style={styles.optionsMenu}>
          // In your PostDetailScreen.tsx, replace the EditPost button:
{isAuthor && (
  <TouchableOpacity
    style={styles.optionItem}
    onPress={() => {
      setShowOptions(false);
      // Show alert until EditPost is implemented
      Alert.alert(
        'Edit Post',
        'Edit feature is coming soon!',
        [{ text: 'OK' }]
      );
      // Or navigate to CreatePost with edit data:
      // navigation.navigate('CreatePost', { postId, isEditing: true });
    }}
  >
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
              <Text style={[styles.optionText, styles.deleteOptionText]}>Delete Post</Text>
            </TouchableOpacity>
          )}
          
          {!isAuthor && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                handleReportPost();
              }}
            >
              <FontAwesome5 icon={faFlag} size={16} color="#ef4444" />
              <Text style={[styles.optionText, styles.reportOptionText]}>Report Post</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Post Content */}
        <View style={styles.postCard}>
          {/* Author Info */}
          <View style={styles.authorContainer}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {currentPost.author_name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {currentPost.author_name || 'User'}
              </Text>
              <View style={styles.postMeta}>
                <Text style={styles.postTime}>
                  {formatDate(currentPost.created_at)}
                </Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>
                    {currentPost.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Post Title & Content */}
          <Text style={styles.postTitle}>{currentPost.title}</Text>
          
          {currentPost.image_url && (
            <Image source={{ uri: currentPost.image_url }} style={styles.postImage} />
          )}
          
          <Text style={styles.postContent}>{currentPost.description}</Text>

          {/* Stats & Actions */}
          <View style={styles.postStats}>
            <View style={styles.statsItem}>
              <FontAwesome5 icon={faThumbsUp} size={16} color="#10b981" />
              <Text style={styles.statsText}>{currentPost.likes_count} Likes</Text>
            </View>
            <View style={styles.statsItem}>
              <FontAwesome5 icon={faComment} size={16} color="#3b82f6" />
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
                icon={faThumbsUp} 
                size={18} 
                color={currentPost.user_has_liked ? '#10b981' : '#94a3b8'} 
              />
              <Text style={[
                styles.actionButtonText,
                currentPost.user_has_liked && styles.likedButtonText
              ]}>
                Like
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 icon={faComment} size={18} color="#94a3b8" />
              <Text style={styles.actionButtonText}>Comment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 icon={faShare} size={18} color="#94a3b8" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome5 icon={faBookmark} size={18} color="#94a3b8" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>
            Comments ({currentPost.comments?.length || 0})
          </Text>

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
                placeholderTextColor="#94a3b8"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <FontAwesome5 icon={faPaperPlane} size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          {currentPost.comments?.length === 0 ? (
            <View style={styles.noComments}>
              <FontAwesome5 icon={faComment} size={40} color="#475569" />
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
                    <Text style={styles.commentTime}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  optionsButton: {
    padding: 8,
  },
  optionsMenu: {
    position: 'absolute',
    top: 70,
    right: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  deleteOptionText: {
    color: '#ef4444',
  },
  reportOptionText: {
    color: '#ef4444',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  categoryTag: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 32,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  postContent: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 20,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: '#065f4620',
  },
  actionButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  likedButtonText: {
    color: '#10b981',
  },
  commentsContainer: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  commentInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInputInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noCommentsSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    color: '#94a3b8',
    fontSize: 11,
  },
  commentText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PostDetailScreen;