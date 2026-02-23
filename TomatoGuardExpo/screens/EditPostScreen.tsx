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
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useForum } from '../hooks/useForum';
import { forumService } from '../services/api/forumService';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';

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
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
};

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
  initialData,
}) => {
  const { authState } = useAuth();
  const { updatePost, fetchPost } = useForum();

  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.description);
  const [category, setCategory] = useState(initialData.category);
  const [selectedImages, setSelectedImages] = useState<string[]>(initialData.image_urls || []);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'diseases', label: 'Diseases' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'general', label: 'General' },
    { id: 'questions', label: 'Questions' },
    { id: 'success', label: 'Success Stories' },
  ];

  const getCategoryColor = (catId: string) => {
    const colors: { [key: string]: any } = {
      diseases: { backgroundColor: '#fdecea', borderColor: COLORS.errorRed },
      treatment: { backgroundColor: '#e8f5ec', borderColor: COLORS.accentGreen },
      general: { backgroundColor: '#e8f0fe', borderColor: '#4a7ee8' },
      questions: { backgroundColor: '#fff8e1', borderColor: '#f59e0b' },
      success: { backgroundColor: '#ede9fe', borderColor: '#8b5cf6' },
    };
    return colors[catId] || { backgroundColor: '#e8f0fe', borderColor: '#4a7ee8' };
  };

  const getCategoryTextColor = (catId: string) => {
    const colors: { [key: string]: string } = {
      diseases: COLORS.errorRed,
      treatment: COLORS.accentGreen,
      general: '#4a7ee8',
      questions: '#f59e0b',
      success: '#8b5cf6',
    };
    return colors[catId] || '#4a7ee8';
  };

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
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
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

    if (!title.trim()) {
      isWeb ? window.alert('Please enter a title') : Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      isWeb ? window.alert('Please enter content') : Alert.alert('Error', 'Please enter content');
      return;
    }

    setLoading(true);
    try {
      const newLocalImages: string[] = [];
      for (const uri of selectedImages) {
        if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
          newLocalImages.push(uri);
        }
      }

      let uploadedUrls: string[] = [];
      if (newLocalImages.length > 0) {
        uploadedUrls = await forumService.uploadPostImages(postId, newLocalImages, authState.accessToken || '');
      }

      const finalImageUrls: string[] = [];
      let uploadedIdx = 0;
      for (const uri of selectedImages) {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
          finalImageUrls.push(uri);
        } else {
          if (uploadedIdx < uploadedUrls.length) {
            finalImageUrls.push(uploadedUrls[uploadedIdx]);
            uploadedIdx++;
          }
        }
      }

      await updatePost(postId, {
        title,
        category,
        description: content,
        image_urls: finalImageUrls,
      });

      try {
        await fetchPost(postId);
      } catch (error) {
        console.error('Could not refresh post data:', error);
      }

      if (isWeb) {
        window.alert('Post updated successfully!');
        setActiveTab('forum');
      } else {
        Alert.alert('Success', 'Post updated successfully!', [
          { text: 'OK', onPress: () => setActiveTab('forum') },
        ]);
      }
    } catch (error: any) {
      const errorMsg = `Failed to update post: ${error.response?.data?.detail || error.message}`;
      isWeb ? window.alert(errorMsg) : Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveTab('forum')}>
          <FontAwesome5 name="arrow-left" size={isSmallDevice ? 14 : 16} color={COLORS.textLight} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAccentDot} />
          <Text style={styles.headerTitle}>Edit Post</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <FontAwesome5 name="save" size={isSmallDevice ? 13 : 14} color={COLORS.textLight} />
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Accent bar */}
      <View style={styles.headerAccentBar} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >

        {/* ── Author Info ─────────────────────────────────────────────────── */}
        <View style={styles.authorCard}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {authState.user?.full_name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>
              {authState.user?.full_name || 'User'}
            </Text>
            <Text style={styles.authorEmail}>{authState.user?.email}</Text>
          </View>
        </View>

        {/* ── Title Input ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Post Title</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.titleInput}
              placeholder="Post Title"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>
        </View>

        {/* ── Content Input ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Content</Text>
          </View>
          <TextInput
            style={styles.contentInput}
            placeholder="What would you like to share with the community? Share your experiences, ask questions, or provide tips..."
            placeholderTextColor={COLORS.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        {/* ── Category Selection ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <FontAwesome5 name="tag" size={isSmallDevice ? 12 : 13} color={COLORS.accentGreen} />
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryList}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    getCategoryColor(cat.id),
                    category === cat.id && styles.categoryChipActive,
                    category === cat.id && { borderColor: getCategoryTextColor(cat.id) },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: getCategoryTextColor(cat.id) },
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

        {/* ── Image Management ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <FontAwesome5 name="images" size={isSmallDevice ? 12 : 13} color={COLORS.accentGreen} />
            <Text style={styles.sectionTitle}>Manage Images</Text>
            {selectedImages.length > 0 && (
              <TouchableOpacity style={styles.clearAllButton} onPress={removeAllImages}>
                <FontAwesome5 name="trash" size={10} color={COLORS.textLight} />
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
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.selectedImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <FontAwesome5 name="times" size={isSmallDevice ? 9 : 10} color={COLORS.textLight} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {selectedImages.length < 10 && (
                    <TouchableOpacity style={styles.addMoreButton} onPress={pickImages}>
                      <FontAwesome5 name="plus" size={isSmallDevice ? 18 : 22} color={COLORS.textMuted} />
                      <Text style={styles.addMoreText}>Add More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
              <Text style={styles.imageCount}>
                {selectedImages.length}/10 images
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImages}>
              <View style={styles.uploadIconWrap}>
                <FontAwesome5 name="image" size={isSmallDevice ? 24 : 28} color={COLORS.accentGreen} />
              </View>
              <Text style={styles.imageUploadText}>Tap to add images</Text>
              <Text style={styles.imageUploadSubtext}>JPG, PNG · max 10 images · 5MB each</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Tips ────────────────────────────────────────────────────────── */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsTitleRow}>
            <FontAwesome5 name="lightbulb" size={isSmallDevice ? 13 : 14} color="#f59e0b" />
            <Text style={styles.tipsTitle}>Edit Tips</Text>
          </View>
          <Text style={styles.tip}>• You can change title, content, and category</Text>
          <Text style={styles.tip}>• Add or remove images as needed</Text>
          <Text style={styles.tip}>• Changes are saved immediately</Text>
          <Text style={styles.tip}>• Original post will be updated for all viewers</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isSmallDevice ? 14 : 20,
    paddingVertical: isSmallDevice ? 14 : 16,
    backgroundColor: COLORS.darkGreen,
  },
  backButton: {
    width: isSmallDevice ? 34 : 40,
    height: isSmallDevice ? 34 : 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAccentDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.limeglow,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 15 : 18,
    fontWeight: '700',
    color: COLORS.textLight,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: COLORS.accentGreen,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.limeglow,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Content ───────────────────────────────────────────────────────────────
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: isSmallDevice ? 14 : 20,
    paddingBottom: 32,
    gap: isSmallDevice ? 14 : 18,
  },

  // ── Author Card ───────────────────────────────────────────────────────────
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  authorAvatar: {
    width: isSmallDevice ? 40 : 48,
    height: isSmallDevice ? 40 : 48,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  authorInitial: {
    fontSize: isSmallDevice ? 16 : 20,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  authorName: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
  },
  authorEmail: {
    fontSize: isSmallDevice ? 11 : 12,
    color: COLORS.textMuted,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 10 : 12,
  },
  sectionAccent: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.accentGreen,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.3,
    flex: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputWrapper: {
    gap: 6,
  },
  titleInput: {
    backgroundColor: COLORS.bgCream,
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.medGreen,
  },
  charCount: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 10 : 11,
    textAlign: 'right',
  },
  contentInput: {
    backgroundColor: COLORS.bgCream,
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 13 : 14,
    padding: isSmallDevice ? 12 : 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.medGreen,
    minHeight: isSmallDevice ? 110 : 140,
    lineHeight: isSmallDevice ? 20 : 22,
  },

  // ── Categories ────────────────────────────────────────────────────────────
  categoryList: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 7 : 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipActive: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    fontWeight: '800',
  },

  // ── Images ────────────────────────────────────────────────────────────────
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    backgroundColor: COLORS.errorRed,
    borderRadius: 8,
  },
  clearAllText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: isSmallDevice ? 110 : 140,
    height: isSmallDevice ? 110 : 140,
    borderRadius: isSmallDevice ? 10 : 12,
    borderWidth: 2,
    borderColor: COLORS.bgLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.errorRed,
    width: isSmallDevice ? 20 : 24,
    height: isSmallDevice ? 20 : 24,
    borderRadius: isSmallDevice ? 6 : 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.textLight,
  },
  addMoreButton: {
    width: isSmallDevice ? 110 : 140,
    height: isSmallDevice ? 110 : 140,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: COLORS.bgCream,
    borderWidth: 2,
    borderColor: COLORS.medGreen,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    gap: 6,
  },
  addMoreText: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '600',
  },
  imageCount: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 11 : 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  imageUploadButton: {
    backgroundColor: COLORS.bgCream,
    borderWidth: 2,
    borderColor: COLORS.medGreen,
    borderStyle: 'dashed',
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 24 : 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadIconWrap: {
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    borderRadius: isSmallDevice ? 16 : 18,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageUploadText: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
  },
  imageUploadSubtext: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 11 : 12,
  },

  // ── Tips ──────────────────────────────────────────────────────────────────
  tipsContainer: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    gap: 4,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipsTitle: {
    color: '#92400e',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
  },
  tip: {
    color: '#78350f',
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: isSmallDevice ? 18 : 20,
  },
});

export default EditPostScreen;