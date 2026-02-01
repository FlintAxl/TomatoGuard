import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainStackNavigationProp } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { forumService, Post as ForumPost, Comment as ForumComment } from '../services/api/forumService';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  faThumbsUp,
  faThumbsDown,
  faComment,
  faUser,
  faBookmark,
  faHistory,
  faTimes,
  faImage,
  faEdit,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

interface Blog {
  id: string;
  title: string;
  author: string;
}

const ForumScreen: React.FC = () => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const { authState } = useAuth();
  
  // State for real posts from backend
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPost, setNewPost] = useState({ title: '', description: '' });
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch posts from backend
  const fetchPosts = async () => {
    console.log('🔍 Auth State Check:');
    console.log('Has user:', !!authState.user);
    console.log('Has accessToken:', !!authState.accessToken);
    console.log('AccessToken length:', authState.accessToken?.length || 0);
    
    if (!authState.accessToken) {
      console.log('❌ No access token - cannot fetch posts');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📡 Fetching posts with token...');
      const fetchedPosts = await forumService.getPosts(authState.accessToken, {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchQuery || undefined
      });
      
      // Debug logging - check what we actually received
      console.log('📊 Forum Posts Debug:');
      console.log('Raw response from API:', fetchedPosts);
      console.log('Type of response:', typeof fetchedPosts);
      console.log('Is array?', Array.isArray(fetchedPosts));
      
      // Ensure we have an array
      const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];
      
      console.log('Total posts fetched:', postsArray.length);
      postsArray.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post.id,
          title: post.title,
          author_name: post.author_name,
          author_id: post.author_id,
          likes_count: post.likes_count
        });
      });
      
      setPosts(postsArray);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on component mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [filterCategory, searchQuery]);

  const blogs: Blog[] = [
    { id: '1', title: '10 Ways to Prevent Tomato Diseases', author: 'Admin' },
    { id: '2', title: 'Understanding Late Blight', author: 'Dr. Garcia' },
    { id: '3', title: 'Organic Farming Best Practices', author: 'Admin' },
    { id: '4', title: 'Seasonal Care Guide', author: 'Expert Team' }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'diseases', label: 'Diseases' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'general', label: 'General' },
    { id: 'questions', label: 'Questions' },
  ];

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    if (!authState.accessToken) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    try {
      const createdPost = await forumService.createPost({
        title: newPost.title,
        description: newPost.description,
        category: 'general',
      }, authState.accessToken);
      
      // Add new post to the beginning of the list
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', description: '' });
      setShowCreateModal(false);
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !authState.accessToken) return;

    try {
      const updatedPost = await forumService.addComment(
        selectedPost.id,
        newComment,
        authState.accessToken
      );
      
      // Update the post in the posts list
      const updatedPosts = posts.map(post => 
        post.id === selectedPost.id ? updatedPost : post
      );
      setPosts(updatedPosts);
      setSelectedPost(updatedPost);
      setNewComment('');
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleVote = async (postId: string, type: 'like') => {
    if (!authState.accessToken) {
      Alert.alert('Error', 'You must be logged in to vote');
      return;
    }

    try {
      const updatedPost = await forumService.toggleLike(postId, authState.accessToken);
      
      // Update the post in the posts list
      const updatedPosts = posts.map(post => 
        post.id === postId ? updatedPost : post
      );
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote');
    }
  };

  // Posts are already filtered by the API call
  const filteredPosts = posts;

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => {
        setSelectedPost(item);
        setShowCommentsModal(true);
      }}
    >
      <View style={styles.postHeader}>
        <View style={styles.postAuthorInfo}>
          <View style={styles.postAvatar}>
            <FontAwesome5 icon={faUser} size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.postAuthorName}>{item.author_name || 'Anonymous'}</Text>
            <Text style={styles.postTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.upvoteBtn]}
          onPress={() => handleVote(item.id, 'like')}
        >
          <FontAwesome5 icon={faThumbsUp} size={16} color="#ffffff" />
          <Text style={styles.actionText}>{item.likes_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.commentBtn]}
          onPress={() => {
            setSelectedPost(item);
            setShowCommentsModal(true);
          }}
        >
          <FontAwesome5 icon={faComment} size={16} color="#ffffff" />
          <Text style={styles.actionText}>{item.comments_count} Comments</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Community Forum</Text>
          <Text style={styles.headerSubtitle}>Share knowledge, ask questions, grow together</Text>
        </View>
        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <FontAwesome5 icon={faEdit} size={16} color="#ffffff" />
          <Text style={styles.createPostText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mainContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <FontAwesome5 icon={faSearch} size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <FontAwesome5 icon={faFilter} size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                filterCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setFilterCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  filterCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Posts Feed */}
        <View style={styles.postsContainer}>
          <Text style={styles.sectionTitle}>Recent Discussions</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found</Text>
              <Text style={styles.emptySubtext}>Be the first to start a discussion!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              renderItem={renderPost}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Featured Blogs */}
        <View style={styles.blogsContainer}>
          <View style={styles.blogsHeader}>
            <Text style={styles.sectionTitle}>Featured Blogs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {blogs.map(blog => (
            <TouchableOpacity key={blog.id} style={styles.blogCard}>
              <View style={styles.blogIcon}>
                <FontAwesome5 icon={faImage} size={20} color="#10b981" />
              </View>
              <View style={styles.blogContent}>
                <Text style={styles.blogTitle}>{blog.title}</Text>
                <Text style={styles.blogAuthor}>by {blog.author}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <FontAwesome5 icon={faTimes} size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.titleInput}
                placeholder="Post Title"
                placeholderTextColor="#94a3b8"
                value={newPost.title}
                onChangeText={text => setNewPost({...newPost, title: text})}
              />
              
              <TextInput
                style={styles.contentInput}
                placeholder="What's on your mind? Share your tomato farming experiences..."
                placeholderTextColor="#94a3b8"
                value={newPost.description}
                onChangeText={text => setNewPost({...newPost, description: text})}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              
              <TouchableOpacity style={styles.addImageBtn}>
                <FontAwesome5 icon={faImage} size={20} color="#10b981" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.postBtn}
                onPress={handleCreatePost}
              >
                <Text style={styles.postBtnText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.commentsModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowCommentsModal(false)}
              >
                <FontAwesome5 icon={faTimes} size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedPost && (
                <View style={styles.selectedPostPreview}>
                  <Text style={styles.postPreviewTitle}>{selectedPost.title}</Text>
                  <Text style={styles.postPreviewContent} numberOfLines={2}>
                    {selectedPost.description}
                  </Text>
                </View>
              )}
              
              <View style={styles.commentsList}>
                {selectedPost?.comments.length === 0 ? (
                  <View style={styles.noComments}>
                    <FontAwesome5 icon={faComment} size={40} color="#64748b" />
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                    <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                  </View>
                ) : (
                  selectedPost?.comments.map((comment, index) => (
                    <View key={comment.id || index} style={styles.commentItem}>
                      <View style={styles.commentAvatar}>
                        <FontAwesome5 icon={faUser} size={16} color="#ffffff" />
                      </View>
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{comment.user_name || 'Anonymous'}</Text>
                          <Text style={styles.commentTime}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.commentText}>{comment.comment}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#94a3b8"
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                style={styles.sendCommentBtn}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Text style={styles.sendCommentText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  createPostText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#1e293b',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#475569',
    borderRadius: 8,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#334155',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
  },
  categoryText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  postsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  postCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    marginBottom: 12,
  },
  postTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  postDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  postActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  upvoteBtn: {
    backgroundColor: '#065f46',
  },
  downvoteBtn: {
    backgroundColor: '#7f1d1d',
  },
  commentBtn: {
    backgroundColor: '#1e40af',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  blogsContainer: {
    padding: 20,
    backgroundColor: '#1e293b',
    marginTop: 8,
  },
  blogsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  blogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  blogIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blogContent: {
    flex: 1,
  },
  blogTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  blogAuthor: {
    color: '#94a3b8',
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  commentsModal: {
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  titleInput: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 12,
  },
  contentInput: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  addImageText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#475569',
  },
  cancelBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  postBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  postBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedPostPreview: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  postPreviewTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  postPreviewContent: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  commentsList: {
    maxHeight: 400,
  },
  noComments: {
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    color: '#64748b',
    fontSize: 18,
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
  addCommentContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  sendCommentBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#10b981',
  },
  sendCommentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForumScreen;