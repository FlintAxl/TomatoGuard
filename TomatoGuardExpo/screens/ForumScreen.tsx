import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainStackNavigationProp } from '../navigation/types';
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

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 72; // Account for padding

interface Blog {
  id: string;
  title: string;
  author: string;
}

interface ForumScreenProps {
  setActiveTab: (tab: string) => void;
  navigateToPostDetail: (postId: string) => void;
}

const ForumScreen: React.FC<ForumScreenProps> = ({ setActiveTab, navigateToPostDetail }) => {
  const navigation = useNavigation<MainStackNavigationProp>();
  const { authState } = useAuth();
  
  // State for posts and UI
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
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
          likes_count: post.likes_count,
          images_count: post.image_urls?.length || 0
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

  const renderPostImages = (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return null;

    // Single image
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

    // Two images
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

    // Three images
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

    // Four or more images - show first 3 with "+N more" overlay on last
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
      onPress={() => navigateToPostDetail(item.id)}
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
        
        {/* Category Badge */}
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

      {/* Render Images */}
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
          onPress={() => navigateToPostDetail(item.id)}
        >
          <FontAwesome5 icon={faComment} size={16} color="#ffffff" />
          <Text style={styles.actionText}>{item.comments_count} Comments</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Helper function to get category colors
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Community Forum</Text>
          <Text style={styles.headerSubtitle}>Share knowledge, ask questions, grow together</Text>
        </View>
        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => setActiveTab('createpost')}
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
                onPress={() => setActiveTab('createpost')}
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
  // Image Styles
  imageContainer: {
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
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
    height: 150,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  blogIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  blogContent: {
    flex: 1,
  },
  blogTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  blogAuthor: {
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default ForumScreen;
