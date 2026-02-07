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

const { width } = Dimensions.get('window');

interface ForumScreenProps {
  setActiveTab: (tab: string) => void;
  navigateToPostDetail: (postId: string) => void;
}

const ForumScreen: React.FC<ForumScreenProps> = ({ setActiveTab, navigateToPostDetail }) => {
  const { authState, updateUser, logout } = useAuth();
  
  // State for posts and UI
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [userData, setUserData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
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

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!authState.accessToken) return;
    
    // Use existing user data from authState if available
    if (authState.user) {
      setUserData(authState.user);
      setLoadingProfile(false);
      return;
    }
    
    setLoadingProfile(true);
    try {
      let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const currentOrigin = window.location.origin;
        const isNgrok = currentOrigin.includes('.ngrok-free.dev') || 
                        currentOrigin.includes('.exp.direct') || 
                        currentOrigin.includes('.ngrok.io');
        
        if (isNgrok) {
          API_BASE_URL = 'http://localhost:8000';
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add these options to help with CORS and ad blockers
        mode: 'cors',
        credentials: 'omit',
      });

      if (response.status === 401) {
        console.log('Session expired, using cached user data');
        // Use cached user data instead of logging out
        if (authState.user) {
          setUserData(authState.user);
        }
        return;
      }

      if (!response.ok) {
        console.error('Profile fetch failed with status:', response.status);
        // Fallback to cached user data
        if (authState.user) {
          setUserData(authState.user);
        }
        return;
      }

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        setUserData(data);
        updateUser(data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        // Fallback to cached user data
        if (authState.user) {
          setUserData(authState.user);
        }
      }
      
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      // Fallback to cached user data instead of showing error
      if (authState.user) {
        setUserData(authState.user);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

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

  // Fetch posts and profile on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  // Refetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [filterCategory, searchQuery]);

  // Refetch posts when overlays close
  useEffect(() => {
    if (!showCreatePost && !showPostDetail) {
      fetchPosts();
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
      {/* Left Sidebar - User Profile (30%) */}
      <View style={styles.sidebar}>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>
                  {userData?.full_name?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.profileName}>
                {userData?.full_name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {userData?.email}
              </Text>
            </View>

            {/* Account Info */}
            <View style={styles.accountInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{userData?.full_name || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{userData?.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: userData?.is_active ? '#10b981' : '#ef4444' }
                  ]} />
                  <Text style={styles.infoValue}>
                    {userData?.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
              
              {userData?.created_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>
                    {new Date(userData.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Create Post Button */}
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setShowCreatePost(true)}
          >
            <FontAwesome5 icon={faEdit} size={16} color="#ffffff" />
            <Text style={styles.createPostButtonText}>Create New Post</Text>
          </TouchableOpacity>
      </View>

      {/* Main Content Area - Posts (70%) */}
      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
          <View style={styles.categoryContainer}>
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
          </View>

          {/* Posts Feed */}
          <View style={styles.postsContainer}>
            <Text style={styles.sectionTitle}>Recent Discussions</Text>
            
            {loading ? (
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
    flexDirection: 'row',
    gap: 20,
  },
  
  // Sidebar Styles (30%)
  sidebar: {
    width: '30%',
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    borderRadius: 20,
    padding: 20,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  profileSection: {
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitial: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  accountInfo: {
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  createPostButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Main Content Styles (70%)
  mainContent: {
    flex: 1,
    backgroundColor: '#2d7736',
    borderRadius: 20,
  },
  searchContainer: {
    padding: 20,
    borderRadius: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchInput: {
    flex: 1,
    color: '#2d7736',
    fontSize: 14,
    marginLeft: 12,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#2d7736',
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,  
  },
  categoryChip: {
    flex: 1, 
    paddingHorizontal: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: 14,
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
    flex: 1,
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
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  imageContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  twoImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  halfImage: {
    flex: 1,
    height: 200,
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
    fontSize: 24,
    fontWeight: 'bold',
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
    fontSize: 13,
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#10b981',
  },
});

export default ForumScreen;