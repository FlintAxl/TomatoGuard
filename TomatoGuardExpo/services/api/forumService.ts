import { getApiClient } from './client';

// ========== TYPES ==========

export interface Comment {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  comment: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  category: string;
  description: string;
  image_urls: string[];
  author_id: string;
  author_name?: string;
  author_email?: string;
  likes: string[];
  likes_count: number;
  comments: Comment[];
  comments_count: number;
  created_at: string;
  updated_at: string;
  user_has_liked: boolean;
}

export interface CreatePostData {
  title: string;
  category: string;
  description: string;
  images?: string[];  // Changed from image_urls to images for clarity
}

export interface UpdatePostData {
  title?: string;
  category?: string;
  description?: string;
  image_urls?: string[];
}

export interface ForumStats {
  total_posts: number;
  total_comments: number;
  total_likes: number;
}

export interface CategoryCount {
  _id: string;
  count: number;
}

// ========== API SERVICE ==========

export const forumService = {
  // ========== POSTS ==========
  
  /**
   * Get all forum posts with optional filters
   */
  getPosts: async (
    token: string,
    options?: {
      category?: string;
      search?: string;
      skip?: number;
      limit?: number;
    }
  ): Promise<Post[]> => {
    const apiClient = getApiClient(token);
    const params = new URLSearchParams();
    
    if (options?.category && options.category !== 'all') {
      params.append('category', options.category);
    }
    
    if (options?.search) {
      params.append('search', options.search);
    }
    
    if (options?.skip) {
      params.append('skip', options.skip.toString());
    }
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    
    const url = `/api/v1/forum/posts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    // Debug logging
    console.log('🔍 Forum API Response:', response);
    console.log('Response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Is array?', Array.isArray(response.data));
    
    // Ensure we return an array
    if (!Array.isArray(response.data)) {
      console.warn('API did not return an array, returning empty array');
      return [];
    }
    
    return response.data;
  },

  /**
   * Get a single post by ID
   */
  getPost: async (postId: string, token: string): Promise<Post> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get(`/api/v1/forum/posts/${postId}`);
    return response.data;
  },

  /**
   * Create a new forum post with images
   */
  createPost: async (postData: CreatePostData, token: string): Promise<Post> => {
    const apiClient = getApiClient(token);
    
    // If there are images, use FormData for multipart upload
    if (postData.images && postData.images.length > 0) {
      console.log(`📤 Creating post with ${postData.images.length} images using FormData`);
      
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', postData.title);
      formData.append('category', postData.category);
      formData.append('description', postData.description);
      
      // Add all images to FormData
      for (let index = 0; index < postData.images.length; index++) {
        const imageUri = postData.images[index];
        const filename = imageUri.split('/').pop() || `image_${index}_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        try {
          // Fetch the image as a blob
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          // Append the blob as a file
          formData.append('images', blob, filename);
          
          console.log(`📸 Added image ${index + 1}: ${filename} (${blob.size} bytes)`);
        } catch (error) {
          console.error(`❌ Failed to process image ${index + 1}:`, error);
          throw new Error(`Failed to process image ${filename}`);
        }
      }
      
      try {
        const response = await apiClient.post('/api/v1/forum/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('✅ Post created successfully with images');
        return response.data;
      } catch (error: any) {
        console.error('❌ FormData upload error:', error);
        console.error('Error response:', error.response?.data);
        throw error;
      }
    } else {
      // No images, use JSON for text-only post
      console.log('📝 Creating text-only post');
      
      const response = await apiClient.post('/api/v1/forum/posts', {
        title: postData.title,
        category: postData.category,
        description: postData.description,
      });
      
      return response.data;
    }
  },

  /**
   * Update an existing post
   */
  updatePost: async (
    postId: string, 
    postData: UpdatePostData, 
    token: string
  ): Promise<Post> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.put(`/api/v1/forum/posts/${postId}`, postData);
    return response.data;
  },

  /**
   * Delete a post
   */
  deletePost: async (postId: string, token: string): Promise<void> => {
    const apiClient = getApiClient(token);
    await apiClient.delete(`/api/v1/forum/posts/${postId}`);
  },

  // ========== COMMENTS ==========
  
  /**
   * Add a comment to a post
   */
  addComment: async (
    postId: string, 
    comment: string, 
    token: string
  ): Promise<Post> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.post(
      `/api/v1/forum/posts/${postId}/comments?comment=${encodeURIComponent(comment)}`
    );
    return response.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (
    postId: string, 
    commentId: string, 
    token: string
  ): Promise<void> => {
    const apiClient = getApiClient(token);
    await apiClient.delete(`/api/v1/forum/posts/${postId}/comments/${commentId}`);
  },

  // ========== LIKES ==========
  
  /**
   * Like or unlike a post
   */
  toggleLike: async (postId: string, token: string): Promise<Post> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.post(`/api/v1/forum/posts/${postId}/like`);
    return response.data;
  },

  // ========== IMAGES ==========
  
  /**
   * Upload additional images to an existing post (Optional)
   */
  uploadPostImages: async (
    postId: string, 
    imageUris: string[], 
    token: string
  ): Promise<string[]> => {
    const apiClient = getApiClient(token);
    
    // Create FormData
    const formData = new FormData();
    
    // Append all images as blobs
    for (let index = 0; index < imageUris.length; index++) {
      const imageUri = imageUris[index];
      const filename = imageUri.split('/').pop() || `image${index}.jpg`;
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      formData.append('images', blob, filename);
    }

    const response = await apiClient.post(
      `/api/v1/forum/posts/${postId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.image_urls;
  },

  /**
   * Delete a specific image from a post
   */
  deletePostImage: async (
    postId: string, 
    imageIndex: number, 
    token: string
  ): Promise<void> => {
    const apiClient = getApiClient(token);
    await apiClient.delete(`/api/v1/forum/posts/${postId}/images/${imageIndex}`);
  },

  // ========== USER POSTS ==========
  
  /**
   * Get all posts by a specific user
   */
  getUserPosts: async (userId: string, token: string): Promise<Post[]> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get(`/api/v1/forum/users/${userId}/posts`);
    return response.data;
  },

  // ========== FORUM DATA ==========
  
  /**
   * Get forum statistics (admin only)
   */
  getForumStats: async (token: string): Promise<ForumStats> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get('/api/v1/forum/stats');
    return response.data;
  },

  /**
   * Get all categories with counts
   */
  getCategories: async (token: string): Promise<CategoryCount[]> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get('/api/v1/forum/categories');
    return response.data;
  },

  /**
   * Search posts by keyword
   */
  searchPosts: async (query: string, token: string): Promise<Post[]> => {
    const apiClient = getApiClient(token);
    const response = await apiClient.get(`/api/v1/forum/posts?search=${encodeURIComponent(query)}`);
    return response.data;
  },
};