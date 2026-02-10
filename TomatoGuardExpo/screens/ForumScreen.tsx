// TomatoGuardExpo/src/screens/ForumScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { forumService, Post as ForumPost } from '../services/api/forumService';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  faThumbsUp,
  faComment,
  faUser,
  faEdit,
  faSearch,
  faFilter,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import CreatePostOverlay from '../components/CreatePost';
import PostDetailOverlay from '../components/PostDetails';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ForumScreenProps {
  setActiveTab: (tab: string) => void;
  navigateToPostDetail: (postId: string) => void;
}

const ForumScreen: React.FC<ForumScreenProps> = ({ setActiveTab, navigateToPostDetail }) => {
  const { authState, updateUser, logout } = useAuth();
  
  // State for posts and UI
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveForumTab] = useState<'all' | 'mine'>('all');
  
  // Overlay states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'diseases', label: 'Diseases' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'general', label: 'General' },
    { id: 'questions', label: 'Questions' },
  ];

  // Fetch posts from backend
  const fetchPosts = async () => {
    if (!authState.accessToken) return;
    
    try {
      setLoading(true);
      const fetchedPosts = await forumService.getPosts(authState.accessToken, {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchQuery || undefined
      });
      
      const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];
      setPosts(postsArray);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch my posts
  const fetchMyPosts = async () => {
    if (!authState.accessToken || !authState.user?.id) return;
    
    try {
      setLoadingMyPosts(true);
      const fetchedPosts = await forumService.getUserPosts(authState.user.id, authState.accessToken);
      const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];
      setMyPosts(postsArray);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      setLoadingMyPosts(false);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    fetchMyPosts();
  }, []);

  // Refetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [filterCategory, searchQuery]);

  // Refetch posts when overlays close
  useEffect(() => {
    if (!showCreatePost && !showPostDetail) {
      fetchPosts();
      fetchMyPosts();
    }
  }, [showCreatePost, showPostDetail]);

  const handleVote = async (postId: string, type: 'like') => {
    if (!authState.accessToken) {
      Alert.alert('Error', 'You must be logged in to vote');
      return;
    }

    try {
      const updatedPost = await forumService.toggleLike(postId, authState.accessToken);
      const updatedPosts = posts.map(post => 
        post.id === postId ? updatedPost : post
      );
      setPosts(updatedPosts);
      // Also update in myPosts if present
      setMyPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setShowPostDetail(true);
  };

  const filteredPosts = posts;

  const renderPostImages = (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return null;

    if (imageUrls.length === 1) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrls[0] }}
            style={styles.singleImage}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (imageUrls.length === 2) {
      return (
        <View style={styles.imageContainer}>
          <View style={styles.twoImagesContainer}>
            <Image
              source={{ uri: imageUrls[0] }}
              style={styles.halfImage}
              resizeMode="cover"
            />
            <Image
              source={{ uri: imageUrls[1] }}
              style={styles.halfImage}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    if (imageUrls.length === 3) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrls[0] }}
            style={styles.singleImage}
            resizeMode="cover"
          />
          <View style={styles.twoImagesContainer}>
            <Image
              source={{ uri: imageUrls[1] }}
              style={styles.halfImage}
              resizeMode="cover"
            />
            <Image
              source={{ uri: imageUrls[2] }}
              style={styles.halfImage}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    const remainingCount = imageUrls.length - 3;
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrls[0] }}
          style={styles.singleImage}
          resizeMode="cover"
        />
        <View style={styles.twoImagesContainer}>
          <Image
            source={{ uri: imageUrls[1] }}
            style={styles.halfImage}
            resizeMode="cover"
          />
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrls[2] }}
              style={styles.halfImage}
              resizeMode="cover"
            />
            {remainingCount > 0 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostClick(item.id)}
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
        
        {item.category && (
          <View style={[styles.categoryBadge, getCategoryColor(item.category)]}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      {renderPostImages(item.image_urls)}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn, 
            styles.upvoteBtn,
            item.user_has_liked && styles.upvoteBtnActive
          ]}
          onPress={() => handleVote(item.id, 'like')}
        >
          <FontAwesome5 
            icon={faThumbsUp} 
            size={16} 
            color={item.user_has_liked ? "#10b981" : "#ffffff"} 
          />
          <Text style={[
            styles.actionText,
            item.user_has_liked && styles.actionTextActive
          ]}>
            {item.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.commentBtn]}
          onPress={() => handlePostClick(item.id)}
        >
          <FontAwesome5 icon={faComment} size={16} color="#ffffff" />
          <Text style={styles.actionText}>{item.comments_count} Comments</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: any } = {
      diseases: { backgroundColor: '#ef444420', borderColor: '#ef4444' },
      treatment: { backgroundColor: '#10b98120', borderColor: '#10b981' },
      general: { backgroundColor: '#3b82f620', borderColor: '#3b82f6' },
      questions: { backgroundColor: '#f59e0b20', borderColor: '#f59e0b' },
      success: { backgroundColor: '#8b5cf620', borderColor: '#8b5cf6' },
    };
    return colors[category] || { backgroundColor: '#3b82f620', borderColor: '#3b82f6' };
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area - Full Width */}
      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar and Create Post Button */}
          <View style={styles.topBar}>
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

            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => setShowCreatePost(true)}
            >
              <FontAwesome5 icon={faEdit} size={16} color="#ffffff" />
              {SCREEN_WIDTH >= 768 && (
                <Text style={styles.createPostButtonText}>Create Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Feed Toggle Tabs */}
          <View style={styles.feedToggleContainer}>
            <View style={styles.feedToggle}>
              <TouchableOpacity
                style={[
                  styles.feedToggleBtn,
                  activeTab === 'all' && styles.feedToggleBtnActive,
                ]}
                onPress={() => setActiveForumTab('all')}
              >
                <FontAwesome5 icon={faComment} size={14} color={activeTab === 'all' ? '#ffffff' : '#94a3b8'} />
                <Text style={[styles.feedToggleText, activeTab === 'all' && styles.feedToggleTextActive]}>All Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feedToggleBtn,
                  activeTab === 'mine' && styles.feedToggleBtnActive,
                ]}
                onPress={() => setActiveForumTab('mine')}
              >
                <FontAwesome5 icon={faUser} size={14} color={activeTab === 'mine' ? '#ffffff' : '#94a3b8'} />
                <Text style={[styles.feedToggleText, activeTab === 'mine' && styles.feedToggleTextActive]}>My Posts</Text>
                {myPosts.length > 0 && (
                  <View style={styles.feedToggleBadge}>
                    <Text style={styles.feedToggleBadgeText}>{myPosts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
            >
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
          </View>

          {/* Posts Feed */}
          <View style={styles.postsContainer}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'mine' ? 'My Posts' : 'Recent Discussions'}
            </Text>
            
            {activeTab === 'all' ? (
              // ===== ALL POSTS TAB =====
              loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10b981" />
                  <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
              ) : filteredPosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 icon={faImage} size={48} color="#475569" />
                  <Text style={styles.emptyText}>No posts found</Text>
                  <Text style={styles.emptySubtext}>Be the first to start a discussion!</Text>
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => setShowCreatePost(true)}
                  >
                    <Text style={styles.emptyButtonText}>Create Post</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredPosts}
                  renderItem={renderPost}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )
            ) : (
              // ===== MY POSTS TAB =====
              loadingMyPosts ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#10b981" />
                  <Text style={styles.loadingText}>Loading your posts...</Text>
                </View>
              ) : myPosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 icon={faEdit} size={48} color="#475569" />
                  <Text style={styles.emptyText}>You haven't posted yet</Text>
                  <Text style={styles.emptySubtext}>Share your thoughts with the community!</Text>
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => setShowCreatePost(true)}
                  >
                    <Text style={styles.emptyButtonText}>Create Your First Post</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={myPosts}
                  renderItem={renderPost}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )
            )}
          </View>
        </ScrollView>
      </View>

      {/* Overlays */}
      <CreatePostOverlay
        visible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

      <PostDetailOverlay
        visible={showPostDetail}
        onClose={() => {
          setShowPostDetail(false);
          setSelectedPostId(null);
        }}
        postId={selectedPostId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Main Content Styles - Full Width
  mainContent: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: SCREEN_WIDTH < 768 ? 0 : 20,
  },

  // Top Bar with Search and Create Post Button
  topBar: {
    flexDirection: SCREEN_WIDTH < 768 ? 'column' : 'row',
    padding: SCREEN_WIDTH < 768 ? 16 : 20,
    gap: SCREEN_WIDTH < 768 ? 12 : 16,
    alignItems: SCREEN_WIDTH < 768 ? 'stretch' : 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: SCREEN_WIDTH < 768 ? 12 : 16,
  },
  searchInput: {
    flex: 1,
    color: '#2d7736',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    marginLeft: 12,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#2d7736',
    borderRadius: 8,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: SCREEN_WIDTH < 768 ? 12 : 14,
    paddingHorizontal: SCREEN_WIDTH < 768 ? 16 : 20,
    borderRadius: 12,
    gap: 8,
    minWidth: SCREEN_WIDTH < 768 ? undefined : 160,
  },
  createPostButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Feed Toggle Container
  feedToggleContainer: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 16 : 20,
    paddingVertical: 12,
  },
  feedToggle: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  feedToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SCREEN_WIDTH < 768 ? 10 : 12,
    paddingHorizontal: SCREEN_WIDTH < 768 ? 12 : 16,
    borderRadius: 10,
    gap: 8,
    backgroundColor: 'transparent',
  },
  feedToggleBtnActive: {
    backgroundColor: '#10b98125',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  feedToggleText: {
    color: '#94a3b8',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontWeight: '500',
  },
  feedToggleTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  feedToggleBadge: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  feedToggleBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Category Filter
  categoryContainer: {
    paddingVertical: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 16 : 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 14 : 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#e9523a',
  },
  categoryText: {
    color: '#2d7736',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },

  // Posts Container
  postsContainer: {
    padding: SCREEN_WIDTH < 768 ? 16 : 20,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH < 768 ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: SCREEN_WIDTH < 768 ? 14 : 16,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 16 : 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Post Card
  postCard: {
    backgroundColor: '#1e293b',
    borderRadius: SCREEN_WIDTH < 768 ? 12 : 16,
    padding: SCREEN_WIDTH < 768 ? 14 : 16,
    marginBottom: SCREEN_WIDTH < 768 ? 12 : 16,
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
    flex: 1,
  },
  postAvatar: {
    width: SCREEN_WIDTH < 768 ? 36 : 40,
    height: SCREEN_WIDTH < 768 ? 36 : 40,
    borderRadius: SCREEN_WIDTH < 768 ? 18 : 20,
    backgroundColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorName: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    fontWeight: '600',
  },
  postTime: {
    color: '#94a3b8',
    fontSize: SCREEN_WIDTH < 768 ? 11 : 12,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 10 : 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 10 : 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    marginBottom: 12,
  },
  postTitle: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 16 : 18,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  postDescription: {
    color: '#cbd5e1',
    fontSize: SCREEN_WIDTH < 768 ? 13 : 14,
    lineHeight: SCREEN_WIDTH < 768 ? 18 : 20,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: SCREEN_WIDTH < 768 ? 160 : 200,
    height: SCREEN_WIDTH < 768 ? 160 : 200,
    borderRadius: 12,
  },
  twoImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  halfImage: {
    flex: 1,
    height: SCREEN_WIDTH < 768 ? 160 : 200,
    borderRadius: 8,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  moreImagesText: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 20 : 24,
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH < 768 ? 8 : 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH < 768 ? 10 : 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  upvoteBtn: {
    backgroundColor: '#065f46',
  },
  upvoteBtnActive: {
    backgroundColor: '#10b98130',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  commentBtn: {
    backgroundColor: '#1e40af',
  },
  actionText: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 12 : 13,
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#10b981',
  },
});

export default ForumScreen;