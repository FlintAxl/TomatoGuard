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
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { forumService, Post as ForumPost } from '../services/api/forumService';
import { FontAwesome5 } from '@expo/vector-icons'; // Only this import needed
import CreatePostOverlay from '../components/CreatePost';
import PostDetailOverlay from '../components/PostDetails';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  cardBg: 'rgb(30, 61, 42)',
  navBg: '#0d2018',
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
};

interface ForumScreenProps {
  setActiveTab: (tab: string) => void;
  navigateToPostDetail: (postId: string) => void;
}

// Updated category icons with string names
const categoryIcons: { [key: string]: string } = {
  all: 'globe',
  diseases: 'bug', // or use 'virus' if available in your FontAwesome5 version
  treatment: 'syringe',
  general: 'leaf',
  questions: 'question-circle',
};

const ForumScreen: React.FC<ForumScreenProps> = ({ setActiveTab, navigateToPostDetail }) => {
  const { authState } = useAuth();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showMyPosts, setShowMyPosts] = useState(false);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [likedPosts, setLikedPosts] = useState<ForumPost[]>([]);
  const [showLikes, setShowLikes] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'diseases', label: 'Diseases' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'general', label: 'General' },
    { id: 'questions', label: 'Questions' },
  ];

  const fetchPosts = async () => {
    if (!authState.accessToken) return;
    try {
      setLoading(true);
      const fetchedPosts = await forumService.getPosts(authState.accessToken, {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchQuery || undefined,
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

    const fetchLikedPosts = async () => {
    if (!authState.accessToken) return;
    try {
      setLikesLoading(true);
      const posts = await forumService.getMyLikes(authState.accessToken);
      setLikedPosts(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleShowLikes = () => {
  setShowMyPosts(false);
  setShowLikes(prev => {
    if (!prev) fetchLikedPosts();
    return !prev;
  });
};

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

  useEffect(() => {
    fetchPosts();
    fetchMyPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, searchQuery]);

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
      setPosts(prev => prev.map(post => (post.id === postId ? updatedPost : post)));
      setMyPosts(prev => prev.map(post => (post.id === postId ? updatedPost : post)));
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setShowPostDetail(true);
  };

  const displayedPosts = showLikes ? likedPosts : showMyPosts ? myPosts : posts;
const isLoadingDisplayed = showLikes ? likesLoading : showMyPosts ? loadingMyPosts : loading;

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

  const renderPostImages = (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return null;

    if (imageUrls.length === 1) {
      return (
        <View style={sharedStyles.imageContainer}>
          <Image source={{ uri: imageUrls[0] }} style={sharedStyles.singleImage} resizeMode="cover" />
        </View>
      );
    }

    if (imageUrls.length === 2) {
      return (
        <View style={sharedStyles.imageContainer}>
          <View style={sharedStyles.twoImagesContainer}>
            <Image source={{ uri: imageUrls[0] }} style={sharedStyles.halfImage} resizeMode="cover" />
            <Image source={{ uri: imageUrls[1] }} style={sharedStyles.halfImage} resizeMode="cover" />
          </View>
        </View>
      );
    }

    if (imageUrls.length === 3) {
      return (
        <View style={sharedStyles.imageContainer}>
          <Image source={{ uri: imageUrls[0] }} style={sharedStyles.singleImage} resizeMode="cover" />
          <View style={sharedStyles.twoImagesContainer}>
            <Image source={{ uri: imageUrls[1] }} style={sharedStyles.halfImage} resizeMode="cover" />
            <Image source={{ uri: imageUrls[2] }} style={sharedStyles.halfImage} resizeMode="cover" />
          </View>
        </View>
      );
    }

    const remainingCount = imageUrls.length - 3;
    return (
      <View style={sharedStyles.imageContainer}>
        <Image source={{ uri: imageUrls[0] }} style={sharedStyles.singleImage} resizeMode="cover" />
        <View style={sharedStyles.twoImagesContainer}>
          <Image source={{ uri: imageUrls[1] }} style={sharedStyles.halfImage} resizeMode="cover" />
          <View style={sharedStyles.imageWrapper}>
            <Image source={{ uri: imageUrls[2] }} style={sharedStyles.halfImage} resizeMode="cover" />
            {remainingCount > 0 && (
              <View style={sharedStyles.moreImagesOverlay}>
                <Text style={sharedStyles.moreImagesText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={sharedStyles.postCard}
      onPress={() => handlePostClick(item.id)}
      activeOpacity={0.92}
    >
      <View style={sharedStyles.postCardAccent} />
      <View style={sharedStyles.postCardInner}>
        {/* Header */}
        <View style={sharedStyles.postHeader}>
          <View style={sharedStyles.postAuthorInfo}>
            <View style={sharedStyles.postAvatar}>
              <FontAwesome5 name="user" size={isSmallDevice ? 11 : 14} color={COLORS.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={sharedStyles.postAuthorName}>{item.author_name || 'Anonymous'}</Text>
              <Text style={sharedStyles.postTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
          {item.category && (
            <View style={[sharedStyles.categoryBadge, getCategoryColor(item.category)]}>
              <Text style={[sharedStyles.categoryBadgeText, { color: getCategoryTextColor(item.category) }]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={sharedStyles.postContent}>
          <Text style={sharedStyles.postTitle}>{item.title}</Text>
          <Text style={sharedStyles.postDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>

        {renderPostImages(item.image_urls)}

        {/* Actions */}
        <View style={sharedStyles.postActions}>
          <TouchableOpacity
            style={[sharedStyles.actionBtn, sharedStyles.upvoteBtn, item.user_has_liked && sharedStyles.upvoteBtnActive]}
            onPress={() => handleVote(item.id, 'like')}
          >
            <FontAwesome5
              name="thumbs-up"
              size={isSmallDevice ? 11 : 13}
              color={item.user_has_liked ? COLORS.textLight : COLORS.darkGreen}
            />
            <Text style={[sharedStyles.actionText, item.user_has_liked && sharedStyles.actionTextActive]}>
              {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[sharedStyles.actionBtn, sharedStyles.commentBtn]}
            onPress={() => handlePostClick(item.id)}
          >
            <FontAwesome5 name="comment" size={isSmallDevice ? 11 : 13} color={COLORS.accentGreen} />
            <Text style={sharedStyles.commentActionText}>{item.comments_count} Comments</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={sharedStyles.emptyContainer}>
      <View style={sharedStyles.emptyIconWrap}>
        <FontAwesome5
          name={showMyPosts ? "edit" : "image"}
          size={isSmallDevice ? 28 : 36}
          color={COLORS.accentGreen}
        />
      </View>
      <Text style={sharedStyles.emptyText}>
        {showMyPosts ? "You haven't posted yet" : 'No posts found'}
      </Text>
      <Text style={sharedStyles.emptySubtext}>
        {showMyPosts
          ? 'Share your thoughts with the community!'
          : 'Be the first to start a discussion!'}
      </Text>
      <TouchableOpacity style={sharedStyles.emptyButton} onPress={() => setShowCreatePost(true)}>
        <Text style={sharedStyles.emptyButtonText}>
          {showMyPosts ? 'Create Your First Post' : 'Create Post'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isSmallDevice) {
    return (
      <View style={mobileStyles.container}>

        {/* Search Row + Create Post Button */}
        <View style={mobileStyles.searchRow}>
          <View style={mobileStyles.searchInputContainer}>
            <FontAwesome5 name="search" size={14} color={COLORS.textMuted} />
            <TextInput
              style={mobileStyles.searchInput}
              placeholder="Search discussions..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={mobileStyles.createBtn}
            onPress={() => setShowCreatePost(true)}
          >
            <FontAwesome5 name="edit" size={15} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Category + My Posts Horizontal Scroll Row */}
        <View style={mobileStyles.categoryBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mobileStyles.categoryScroll}
          >
            {/* My Posts chip */}
            <TouchableOpacity
              style={[
                mobileStyles.categoryChip,
                showMyPosts && mobileStyles.categoryChipActive,
              ]}
              onPress={() => setShowMyPosts(prev => !prev)}
            >
              <Text style={[
                mobileStyles.categoryChipText,
                showMyPosts && mobileStyles.categoryChipTextActive,
              ]}>
                MY POSTS
              </Text>
              {myPosts.length > 0 && (
                <View style={mobileStyles.chipBadge}>
                  <Text style={mobileStyles.chipBadgeText}>{myPosts.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* My Likes chip — NEW */}
          <TouchableOpacity
            style={[mobileStyles.categoryChip, showLikes && mobileStyles.categoryChipActive]}
            onPress={handleShowLikes}
          >
            <FontAwesome5 name="heart" size={10} color={showLikes ? COLORS.textLight : COLORS.textMuted} />
            <Text style={[mobileStyles.categoryChipText, showLikes && mobileStyles.categoryChipTextActive]}>
              MY LIKES
            </Text>
            {likedPosts.length > 0 && (
              <View style={mobileStyles.chipBadge}>
                <Text style={mobileStyles.chipBadgeText}>{likedPosts.length}</Text>
              </View>
            )}
          </TouchableOpacity>

            {/* Category chips */}
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  mobileStyles.categoryChip,
                  !showMyPosts && filterCategory === category.id && mobileStyles.categoryChipActive,
                ]}
                onPress={() => {
                  setFilterCategory(category.id);
                  setShowMyPosts(false);
                }}
              >
                <Text style={[
                  mobileStyles.categoryChipText,
                  !showMyPosts && filterCategory === category.id && mobileStyles.categoryChipTextActive,
                ]}>
                  {category.label.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Scrollable Posts Feed */}
        <ScrollView
          style={mobileStyles.feed}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={mobileStyles.feedContent}
        >
          {isLoadingDisplayed ? (
            <View style={sharedStyles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accentGreen} />
              <Text style={sharedStyles.loadingText}>Loading posts...</Text>
            </View>
          ) : displayedPosts.length === 0 ? (
            renderEmpty()
          ) : (
            <FlatList
              data={displayedPosts}
              renderItem={renderPost}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ScrollView>

        {/* Overlays */}
        <CreatePostOverlay visible={showCreatePost} onClose={() => setShowCreatePost(false)} />
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
  }

  // ── WEB / TABLET 3-COLUMN LAYOUT ──────────────────────────────────────────
  return (
    <View style={webStyles.container}>
      <View style={webStyles.columnsWrapper}>

        {/* LEFT SIDEBAR — Categories */}
        <View style={webStyles.leftSidebar}>
          <Text style={webStyles.sidebarTitle}>Post Categories</Text>
          <View style={webStyles.userDivider} />
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                webStyles.categoryItem,
                !showMyPosts && filterCategory === category.id && webStyles.categoryItemActive,
              ]}
              onPress={() => {
                setFilterCategory(category.id);
                setShowMyPosts(false);
              }}
            >
              <View style={webStyles.categoryIconWrap}>
                <FontAwesome5
                  name={categoryIcons[category.id] || "globe"}
                  size={14}
                  color={
                    !showMyPosts && filterCategory === category.id
                      ? COLORS.limeglow
                      : 'rgba(255,255,255,0.6)'
                  }
                />
              </View>
              <Text style={[
                webStyles.categoryItemText,
                !showMyPosts && filterCategory === category.id && webStyles.categoryItemTextActive,
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CENTER — Posts Feed (only this scrolls) */}
        <View style={webStyles.centerColumn}>
          {/* Search Bar */}
          <View style={webStyles.searchSection}>
            <View style={webStyles.searchInputContainer}>
              <FontAwesome5 name="search" size={14} color={COLORS.textMuted} />
              <TextInput
                style={webStyles.searchInput}
                placeholder="Search discussions..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={webStyles.filterBtn}>
                <FontAwesome5 name="filter" size={14} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Label */}
          <View style={webStyles.sectionTitleRow}>
            <View style={webStyles.sectionTitleAccent} />
            <Text style={webStyles.sectionTitle}>
              {showLikes ? 'My Liked Posts' : showMyPosts ? 'My Posts' : 'Recent Discussions'}
            </Text>
          </View>

          {/* Scrollable posts */}
          <ScrollView showsVerticalScrollIndicator={false} style={webStyles.postsScroll}>
            {isLoadingDisplayed ? (
              <View style={sharedStyles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accentGreen} />
                <Text style={sharedStyles.loadingText}>Loading posts...</Text>
              </View>
            ) : displayedPosts.length === 0 ? (
              renderEmpty()
            ) : (
              <FlatList
                data={displayedPosts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            )}
          </ScrollView>
        </View>

        {/* RIGHT SIDEBAR — User Info */}
        <View style={webStyles.rightSidebar}>
          <View style={webStyles.userAvatarWrap}>
            {authState.user?.profile_picture ? (
              <Image source={{ uri: authState.user.profile_picture }} style={webStyles.userAvatar} />
            ) : (
              <View style={webStyles.userAvatarPlaceholder}>
                <FontAwesome5 name="user" size={36} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </View>

          <Text style={webStyles.userNameText}>
            {authState.user?.full_name || authState.user?.email || 'User Name'}
          </Text>
          <Text style={webStyles.userEmailText}>
            {authState.user?.email || 'user@email.com'}
          </Text>

          <View style={webStyles.userDivider} />
            
          <TouchableOpacity
            style={webStyles.sidebarActionBtn}
            onPress={() => setShowCreatePost(true)}
          >
            <FontAwesome5 name="edit" size={14} color={COLORS.textLight} />
            <Text style={webStyles.sidebarActionBtnText}>CREATE POSTS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              webStyles.sidebarActionBtn,
              webStyles.sidebarActionBtnSecondary,
              showMyPosts && webStyles.sidebarActionBtnSecondaryActive,
            ]}
            onPress={() => setShowMyPosts(prev => !prev)}
          >
            <FontAwesome5
              name="user"
              size={14}
              color={showMyPosts ? COLORS.textLight : COLORS.textMuted}
            />
            <Text style={[
              webStyles.sidebarActionBtnText,
              !showMyPosts && webStyles.sidebarActionBtnTextMuted,
            ]}>
              MY POSTS
            </Text>
            {myPosts.length > 0 && (
              <View style={webStyles.myPostsBadge}>
                <Text style={webStyles.myPostsBadgeText}>{myPosts.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
  style={[
    webStyles.sidebarActionBtn,
    webStyles.sidebarActionBtnSecondary,
    showLikes && webStyles.sidebarActionBtnSecondaryActive,
  ]}
  onPress={handleShowLikes}
>
  <FontAwesome5
    name="heart"
    size={14}
    color={showLikes ? COLORS.textLight : COLORS.textMuted}
  />
  <Text style={[
    webStyles.sidebarActionBtnText,
    !showLikes && webStyles.sidebarActionBtnTextMuted,
  ]}>
    MY LIKES
  </Text>
  {likedPosts.length > 0 && (
    <View style={webStyles.myPostsBadge}>
      <Text style={webStyles.myPostsBadgeText}>{likedPosts.length}</Text>
    </View>
  )}
</TouchableOpacity>
          <View style={webStyles.userDivider} />
          <Image
            source={{ uri: 'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771421723/tom_1_s5mxkw.gif' }}
            style={{ width: '100%', height: '30%', borderRadius: 10, marginTop: 10, marginBottom: 10 }}
            resizeMode="cover"
          />
        </View>
            
      </View>

      {/* Overlays */}
      <CreatePostOverlay visible={showCreatePost} onClose={() => setShowCreatePost(false)} />
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

// ── SHARED STYLES (post cards, images, empty/loading states) ─────────────────
const sharedStyles = StyleSheet.create({
  postCard: {
    backgroundColor: COLORS.bgCream,
    borderRadius: 14,
    borderColor: COLORS.medGreen,
    marginBottom: 12,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 2,
  },
  postCardInner: {
    padding: isSmallDevice ? 12 : 14,
  },
  postCardAccent: {
    // Add your accent styles here if needed
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  postAvatar: {
    width: isSmallDevice ? 30 : 50,
    height: isSmallDevice ? 30 : 50,
    borderRadius: isSmallDevice ? 15 : 37,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorName: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 12 : 20,
    fontWeight: '600',
  },
  postTime: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 9 : 10,
    marginTop: 5,
  },
  categoryBadge: {
    paddingHorizontal: isSmallDevice ? 8 : 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  postContent: {
    marginBottom: 10,
  },
  postTitle: {
    color: COLORS.darkGreen,
    fontSize: isSmallDevice ? 13 : 25,
    fontWeight: '700',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  postDescription: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 11 : 12,
    lineHeight: isSmallDevice ? 16 : 22,
  },
  imageContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0ede6',
  },
  singleImage: {
    width: isSmallDevice ? 130 : 160,
    height: isSmallDevice ? 130 : 160,
    alignSelf: 'center',
    borderRadius: 8,
  },
  twoImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  halfImage: {
    flex: 1,
    height: isSmallDevice ? 120 : 150,
    borderRadius: 8,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  moreImagesText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 16 : 20,
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0ede6',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: 8,
    gap: 5,
  },
  upvoteBtn: {
    backgroundColor: COLORS.bgCream,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },
  upvoteBtnActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreen,
  },
  commentBtn: {
    backgroundColor: COLORS.bgCream,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },
  actionText: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '500',
  },
  actionTextActive: {
    color: COLORS.textLight,
  },
  commentActionText: {
    color: COLORS.accentGreen,
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconWrap: {
    width: isSmallDevice ? 60 : 72,
    height: isSmallDevice ? 60 : 72,
    borderRadius: isSmallDevice ? 30 : 36,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
});

// ── MOBILE-ONLY STYLES ───────────────────────────────────────────────────────
const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.textLight,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0ddd6',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 13,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.darkGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBar: {
    backgroundColor: COLORS.textLight,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#e8e4db',
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: COLORS.darkGreen,
    borderColor: COLORS.darkGreen,
  },
  categoryChipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  categoryChipTextActive: {
    color: COLORS.textLight,
  },
  chipBadge: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chipBadgeText: {
    color: COLORS.textLight,
    fontSize: 9,
    fontWeight: '700',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: 12,
    paddingBottom: 24,
  },
});

// ── WEB-ONLY STYLES ──────────────────────────────────────────────────────────
const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
    overflow: 'hidden' as any,
  },
  columnsWrapper: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden' as any,
  },

  // Left sidebar
  leftSidebar: {
    width: 250,
    height: '110%',
    backgroundColor: COLORS.darkGreen,
    paddingTop: 24,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginLeft: 20,
  },
  sidebarTitle: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingLeft: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    gap: 10,
  },
  categoryItemActive: {
    backgroundColor: COLORS.accentGreen,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItemText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryItemTextActive: {
    color: COLORS.limeglow,
    fontWeight: '700',
  },

  // Center column
  centerColumn: {
    flex: 1,
    backgroundColor: COLORS.textLight,
    flexDirection: 'column',
    overflow: 'hidden' as any,
  },
  postsScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.textLight,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0ddd6',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 13,
  },
  filterBtn: {
    padding: 6,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: '#f5f5f0',
  },
  sectionTitleAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    fontStyle: 'italic',
  },

  // Right sidebar
  rightSidebar: {
    width: 250,
    height: '110%',
    backgroundColor: COLORS.darkGreen,
    marginRight: 20,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'hidden' as any,
    borderRadius: 14,
  },
  userAvatarWrap: {
    marginBottom: 14,
  },
  userAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
  },
  userAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.accentGreen,
  },
  userNameText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  userEmailText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  userDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 20,
  },
  sidebarActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentGreen,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  sidebarActionBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sidebarActionBtnSecondaryActive: {
    backgroundColor: COLORS.medGreen,
    borderColor: COLORS.accentGreen,
  },
  sidebarActionBtnText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sidebarActionBtnTextMuted: {
    color: COLORS.textMuted,
  },
  myPostsBadge: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  myPostsBadgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default ForumScreen;