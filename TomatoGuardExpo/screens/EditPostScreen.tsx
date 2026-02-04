import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../hooks/useForum';
import { forumService } from '../services/api/forumService';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  faArrowLeft,
  faImage,
  faTag,
  faSave,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

interface EditPostScreenProps {
  setActiveTab: (tab: string) => void;
  postId: string;
  initialData: {
    title: string;
    description: string;
    category: string;
    image_urls: string[];
  };
}

const EditPostScreen: React.FC<EditPostScreenProps> = ({ 
  setActiveTab, 
  postId, 
  initialData 
}) => {
  const { authState } = useAuth();
  const { updatePost, fetchPost } = useForum(); // ✅ Added fetchPost

  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);
  const [selectedImages, setSelectedImages] = useState<string[]>(initialData.image_urls || []);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'diseases', label: 'Diseases', color: '#ef4444' },
    { id: 'treatment', label: 'Treatment', color: '#10b981' },
    { id: 'general', label: 'General', color: '#3b82f6' },
    { id: 'questions', label: 'Questions', color: '#f59e0b' },
    { id: 'success', label: 'Success Stories', color: '#8b5cf6' },
  ];

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImageUris]);
        Alert.alert('Success', `${newImageUris.length} image(s) added successfully!`);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setSelectedImages([]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    setLoading(true);
    try {
      // Update post text content (title, category, description)
      const updateData = {
        title,
        category,
        description: content,
      };

      console.log('📝 Updating post text fields...');
      await updatePost(postId, updateData);

      // Handle images separately
      const originalImages = initialData.image_urls || [];
      const hasImageChanges = JSON.stringify(originalImages.sort()) !== JSON.stringify(selectedImages.sort());
      
      if (hasImageChanges) {
        console.log('🖼️ Images have changed, updating...');
        console.log('Original:', originalImages);
        console.log('New:', selectedImages);
        
        try {
          await forumService.replacePostImages(postId, selectedImages, authState.accessToken || '');
          console.log('✅ Images updated successfully');
        } catch (error) {
          console.error('❌ Failed to update images:', error);
          Alert.alert('Warning', 'Post text updated but some images failed to update.');
        }
      } else {
        console.log('✓ No image changes detected');
      }

      // ✅ REFETCH POST DATA TO UPDATE UI
      console.log('🔄 Refreshing post data...');
      try {
        await fetchPost(postId);
        console.log('✅ Post data refreshed - images should now be visible');
      } catch (error) {
        console.error('⚠️ Could not refresh post data:', error);
      }

      // Success handling with platform detection
      const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
      
      if (isWeb) {
        window.alert('Post updated successfully!');
        setActiveTab('forum');
      } else {
        Alert.alert(
          'Success',
          'Post updated successfully!',
          [{ 
            text: 'OK', 
            onPress: () => setActiveTab('forum')
          }]
        );
      }
    } catch (error: any) {
      console.error('❌ Update post error:', error);
      Alert.alert('Error', `Failed to update post: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setActiveTab('forum');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <FontAwesome5 icon={faArrowLeft} size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Post</Text>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <FontAwesome5 icon={faSave} size={16} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Author Info */}
        <View style={styles.authorContainer}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {authState.user?.full_name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>
              {authState.user?.full_name || 'User'}
            </Text>
            <Text style={styles.authorEmail}>
              {authState.user?.email}
            </Text>
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Post Title"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="What would you like to share with the community? Share your experiences, ask questions, or provide tips..."
          placeholderTextColor="#94a3b8"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />

        {/* Category Selection */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <FontAwesome5 icon={faTag} size={16} color="#94a3b8" />
            <Text style={styles.categoryTitle}>Category</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryList}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: cat.color + '20' },
                    category === cat.id && {
                      backgroundColor: cat.color,
                    },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Image Management */}
        <View style={styles.imageContainer}>
          <View style={styles.imageHeader}>
            <FontAwesome5 icon={faImage} size={16} color="#94a3b8" />
            <Text style={styles.imageTitle}>Manage Images</Text>
            {selectedImages.length > 0 && (
              <TouchableOpacity style={styles.clearAllButton} onPress={removeAllImages}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedImages.length > 0 ? (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagePreviewContainer}>
                  {selectedImages.map((imageUri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <FontAwesome5 icon={faTimes} size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < 10 && (
                    <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                      <FontAwesome5 icon={faImage} size={24} color="#94a3b8" />
                      <Text style={styles.addMoreText}>Add More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
              <Text style={styles.imageCount}>{selectedImages.length}/10 images</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImages}>
              <FontAwesome5 icon={faImage} size={32} color="#94a3b8" />
              <Text style={styles.imageUploadText}>Tap to add images</Text>
              <Text style={styles.imageUploadSubtext}>JPG, PNG (max 10 images, 5MB each)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Edit Tips:</Text>
          <Text style={styles.tip}>• You can change title, content, and category</Text>
          <Text style={styles.tip}>• Add or remove images as needed</Text>
          <Text style={styles.tip}>• Changes are saved immediately</Text>
          <Text style={styles.tip}>• Original post will be updated</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  authorEmail: {
    fontSize: 14,
    color: '#94a3b8',
  },
  inputContainer: {
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  charCount: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'right',
  },
  contentInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
    minHeight: 120,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButton: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addMoreText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  imageCount: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  imageUploadButton: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  imageUploadText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  imageUploadSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tip: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default EditPostScreen;
