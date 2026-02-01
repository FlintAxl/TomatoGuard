import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../hooks/useForum';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  faArrowLeft,
  faImage,
  faTag,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation();
  const { authState } = useAuth();
  const { createPost } = useForum();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'diseases', label: 'Diseases', color: '#ef4444' },
    { id: 'treatment', label: 'Treatment', color: '#10b981' },
    { id: 'general', label: 'General', color: '#3b82f6' },
    { id: 'questions', label: 'Questions', color: '#f59e0b' },
    { id: 'success', label: 'Success Stories', color: '#8b5cf6' },
  ];

  const pickImage = async () => {
    console.log('🖼️ Image picker button pressed');
    
    try {
      // Request permission first
      console.log('📋 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('📋 Permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Permission denied');
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Permission granted, launching image picker...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      console.log('📸 Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('✅ Selected image URI:', imageUri);
        setSelectedImage(imageUri);
        Alert.alert('Success', 'Image selected successfully!');
      } else {
        console.log('❌ Image selection cancelled or failed');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to pick image: ${errorMessage}`);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
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
      const postData = {
        title,
        category,
        description: content,
        image_url: selectedImage || undefined,
      };

      await createPost(postData);
      
      Alert.alert(
        'Success',
        'Post created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 icon={faArrowLeft} size={20} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Post</Text>
        
        <TouchableOpacity
          style={[styles.postButton, loading && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <FontAwesome5 icon={faPaperPlane} size={16} color="#ffffff" />
          <Text style={styles.postButtonText}>Post</Text>
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

        {/* Image Upload */}
        <View style={styles.imageContainer}>
          <View style={styles.imageHeader}>
            <FontAwesome5 icon={faImage} size={16} color="#94a3b8" />
            <Text style={styles.imageTitle}>Add Image (Optional)</Text>
          </View>
          
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <FontAwesome5 icon={faTimes} size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
              <FontAwesome5 icon={faImage} size={32} color="#94a3b8" />
              <Text style={styles.imageUploadText}>Tap to upload image</Text>
              <Text style={styles.imageUploadSubtext}>JPG, PNG (max 5MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips for a great post:</Text>
          <Text style={styles.tip}>• Be clear and descriptive in your title</Text>
          <Text style={styles.tip}>• Share specific details about your experience</Text>
          <Text style={styles.tip}>• Include photos if relevant to your question</Text>
          <Text style={styles.tip}>• Be respectful to other community members</Text>
          <Text style={styles.tip}>• Use appropriate category for better visibility</Text>
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
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
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
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  authorEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  inputContainer: {
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  charCount: {
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  contentInput: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 20,
    lineHeight: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  imageTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  imageUploadButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  imageUploadSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default CreatePostScreen;