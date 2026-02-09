import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { 
  forumService, 
  Post, 
  Comment, 
  CreatePostData, 
  UpdatePostData,
  CategoryCount,
  ForumStats
} from '../services/api/forumService';

// Hook state interface
interface UseForumState {
  posts: Post[];
  currentPost: Post | null;
  userPosts: Post[];
  categories: CategoryCount[];
  stats: ForumStats | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

// Hook return type
interface UseForumReturn extends UseForumState {
  // Posts
  fetchPosts: (options?: {
    category?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  
  fetchPost: (postId: string) => Promise<void>;
  createPost: (postData: CreatePostData) => Promise<Post>;
  updatePost: (postId: string, postData: UpdatePostData) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  
  // Comments
  addComment: (postId: string, comment: string) => Promise<Post>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  
  // Likes
  toggleLike: (postId: string) => Promise<Post>;
  
  // Images
  uploadPostImage: (postId: string, imageUri: string) => Promise<string>;
  
  // User posts
  fetchUserPosts: (userId?: string) => Promise<void>;
  
  // Forum data
  fetchCategories: () => Promise<void>;
  fetchForumStats: () => Promise<void>;
  
  // Search
  searchPosts: (query: string) => Promise<void>;
  
  // State management
  clearError: () => void;
  setRefreshing: (refreshing: boolean) => void;
  refreshPosts: () => Promise<void>;
}

export const useForum = (): UseForumReturn => {
  const { authState } = useAuth();
  
  // State
  const [state, setState] = useState<UseForumState>({
    posts: [],
    currentPost: null,
    userPosts: [],
    categories: [],
    stats: null,
    loading: false,
    error: null,
    refreshing: false,
  });

  // ========== HELPER FUNCTIONS ==========
  
  const updatePostInList = useCallback((updatedPost: Post) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ),
      currentPost: prev.currentPost?.id === updatedPost.id ? updatedPost : prev.currentPost,
      userPosts: prev.userPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ),
    }));
  }, []);

  const removePostFromList = useCallback((postId: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(post => post.id !== postId),
      currentPost: prev.currentPost?.id === postId ? null : prev.currentPost,
      userPosts: prev.userPosts.filter(post => post.id !== postId),
    }));
  }, []);

  // ========== POST OPERATIONS ==========
  
  const fetchPosts = useCallback(async (options?: {
    category?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    if (!authState.accessToken) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const posts = await forumService.getPosts(authState.accessToken, options);
      setState(prev => ({ ...prev, posts, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch posts';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
    }
  }, [authState.accessToken]);

  const fetchPost = useCallback(async (postId: string) => {
    if (!authState.accessToken) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const post = await forumService.getPost(postId, authState.accessToken);
      setState(prev => ({ ...prev, currentPost: post, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch post';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
    }
  }, [authState.accessToken]);

  const createPost = useCallback(async (postData: CreatePostData): Promise<Post> => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newPost = await forumService.createPost(postData, authState.accessToken);
      
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts],
        userPosts: [newPost, ...prev.userPosts],
        loading: false,
      }));
      
      return newPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create post';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken]);

  const updatePost = useCallback(async (postId: string, postData: UpdatePostData): Promise<Post> => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedPost = await forumService.updatePost(postId, postData, authState.accessToken);
      updatePostInList(updatedPost);
      setState(prev => ({ ...prev, loading: false }));
      return updatedPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update post';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken, updatePostInList]);

  const deletePost = useCallback(async (postId: string) => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await forumService.deletePost(postId, authState.accessToken);
      removePostFromList(postId);
      setState(prev => ({ ...prev, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete post';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw err;
    }
  }, [authState.accessToken, removePostFromList]);

  // ========== COMMENT OPERATIONS ==========
  
  const addComment = useCallback(async (postId: string, comment: string): Promise<Post> => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedPost = await forumService.addComment(postId, comment, authState.accessToken);
      updatePostInList(updatedPost);
      setState(prev => ({ ...prev, loading: false }));
      return updatedPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to add comment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken, updatePostInList]);

  const deleteComment = useCallback(async (postId: string, commentId: string) => {
    if (!authState.accessToken) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await forumService.deleteComment(postId, commentId, authState.accessToken);
      
      // Update local state to remove comment
      setState(prev => {
        const updatePostWithRemovedComment = (post: Post): Post => ({
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId),
          comments_count: Math.max(0, post.comments_count - 1),
        });
        
        return {
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId ? updatePostWithRemovedComment(post) : post
          ),
          currentPost: prev.currentPost?.id === postId 
            ? updatePostWithRemovedComment(prev.currentPost) 
            : prev.currentPost,
          userPosts: prev.userPosts.map(post => 
            post.id === postId ? updatePostWithRemovedComment(post) : post
          ),
          loading: false,
        };
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete comment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken]);

  // ========== LIKE OPERATIONS ==========
  
  const toggleLike = useCallback(async (postId: string): Promise<Post> => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const updatedPost = await forumService.toggleLike(postId, authState.accessToken);
      updatePostInList(updatedPost);
      return updatedPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update like';
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken, updatePostInList]);

  // ========== IMAGE OPERATIONS ==========
  
  const uploadPostImage = useCallback(async (postId: string, imageUri: string): Promise<string> => {
    if (!authState.accessToken) {
      throw new Error('Not authenticated');
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const imageUrl = await forumService.uploadPostImage(postId, imageUri, authState.accessToken);
      
      // Update post with new image URL
      setState(prev => ({
        ...prev,
        currentPost: prev.currentPost?.id === postId 
          ? { ...prev.currentPost, image_url: imageUrl }
          : prev.currentPost,
        loading: false,
      }));
      
      return imageUrl;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload image';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
      throw err;
    }
  }, [authState.accessToken]);

  // ========== USER POSTS ==========
  
  const fetchUserPosts = useCallback(async (userId?: string) => {
    if (!authState.accessToken) return;
    
    const targetUserId = userId || authState.user?.id;
    if (!targetUserId) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userPosts = await forumService.getUserPosts(targetUserId, authState.accessToken);
      setState(prev => ({ ...prev, userPosts, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch user posts';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
    }
  }, [authState.accessToken, authState.user?.id]);

  // ========== FORUM DATA ==========
  
  const fetchCategories = useCallback(async () => {
    if (!authState.accessToken) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const categories = await forumService.getCategories(authState.accessToken);
      setState(prev => ({ ...prev, categories, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch categories';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      // Don't alert for this error as it's not critical
    }
  }, [authState.accessToken]);

  const fetchForumStats = useCallback(async () => {
    if (!authState.accessToken) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await forumService.getForumStats(authState.accessToken);
      setState(prev => ({ ...prev, stats, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch forum stats';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      // Don't alert for this error as it's not critical
    }
  }, [authState.accessToken]);

  // ========== SEARCH ==========
  
  const searchPosts = useCallback(async (query: string) => {
    if (!authState.accessToken) return;
    
    if (!query.trim()) {
      await fetchPosts();
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const posts = await forumService.searchPosts(query, authState.accessToken);
      setState(prev => ({ ...prev, posts, loading: false }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to search posts';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      Alert.alert('Error', errorMessage);
    }
  }, [authState.accessToken, fetchPosts]);

  // ========== UTILITY FUNCTIONS ==========
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setState(prev => ({ ...prev, refreshing }));
  }, []);

  const refreshPosts = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    await fetchPosts();
    setState(prev => ({ ...prev, refreshing: false }));
  }, [fetchPosts]);

  // ========== INITIAL LOAD ==========
  
  useEffect(() => {
    if (authState.accessToken) {
      fetchPosts();
      fetchCategories();
    }
  }, [authState.accessToken, fetchPosts, fetchCategories]);

  return {
    // State
    ...state,
    
    // Posts
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    
    // Comments
    addComment,
    deleteComment,
    
    // Likes
    toggleLike,
    
    // Images
    uploadPostImage,
    
    // User posts
    fetchUserPosts,
    
    // Forum data
    fetchCategories,
    fetchForumStats,
    
    // Search
    searchPosts,
    
    // State management
    clearError,
    setRefreshing,
    refreshPosts,
  };
};