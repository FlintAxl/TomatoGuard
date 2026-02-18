import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground, // Added for background image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52', // Used as color2
  textLight: '#ffffff',
  textDark: '#0d1f14',
  textMuted: '#5a7a65', // Renamed from 'muted' for clarity
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
  lightGreen: '#4a8b5c',
  darkText: '#0a1a12',
};

// Cloudinary link for the background image (using a placeholder; replace with your specific link)
const BACKGROUND_IMAGE_URL = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771333800/Screen_Shot_2026-02-17_at_9.09.39_PM_o8nvq8.png'; // Example: Using the first blog's image; update as needed

// FIXED: Moved the interface to the top with other type declarations
interface BlogsListProps {
  navigateToBlog: (blogId: string) => void;
}

const BLOGS = [
  {
    id: 'blogone',
    title: 'How to Identify, Treat, and Prevent Tomato Diseases',
    description: 'A comprehensive guide to recognizing common tomato diseases, understanding their causes, and implementing effective treatment and prevention strategies.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_3xk5433xk5433xk5_qmc8ap.png',
    date: 'January 15, 2025',
    readTime: '8 min read',
    category: 'Disease Management',
  },
  {
    id: 'blogtwo',
    title: 'Tomatoes: Nutrition Facts and Health Benefits',
    description: 'Discover the nutritional powerhouse that tomatoes are, including their vitamins, minerals, and powerful antioxidants that contribute to overall health.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_xe9pbpxe9pbpxe9p_yaemwf.png', // FIXED: Removed extra 'h' at the beginning
    date: 'January 20, 2025',
    readTime: '6 min read',
    category: 'Nutrition',
  },
  {
    id: 'blogthree',
    title: 'Health Benefits of Tomatoes: What You Need to Know',
    description: 'Explore the incredible health benefits of tomatoes, from heart health to cancer prevention, and learn why this fruit deserves a place in your daily diet.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_ijcjf1ijcjf1ijcj_srnwqq.png',
    date: 'January 25, 2025',
    readTime: '7 min read',
    category: 'Health & Wellness',
  },
];

const BlogsList: React.FC<BlogsListProps> = ({ navigateToBlog }) => {
  const navigation = useNavigation();
  const handleBlogPress = (blogId: string) => {
    navigateToBlog(blogId);
  };

  const handleBackToForum = () => {
    navigation.navigate('Forum');
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE_URL }}
      style={styles.container}
      resizeMode="cover" // Ensures the image covers the entire background
    >
      {/* Blog List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.blogListContainer}
      >
        {BLOGS.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            style={styles.blogCard}
            onPress={() => handleBlogPress(blog.id)}
            activeOpacity={0.8}
          >
            <View style={styles.blogImageContainer}>
              <Image
                source={{ uri: blog.image }}
                style={styles.blogImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(8, 22, 0, 0.9)']}
                style={styles.blogImageGradient}
              />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{blog.category}</Text>
              </View>
            </View>

            <View style={styles.blogContent}>
              <Text style={styles.blogTitle}>{blog.title}</Text>
              <Text style={styles.blogDescription}>{blog.description}</Text>
              
              <View style={styles.blogMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{blog.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{blog.readTime}</Text>
                </View>
              </View>

              <View style={styles.readMoreContainer}>
                <Text style={styles.readMoreText}>Read Article</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.accentGreen} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  blogListContainer: {
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingVertical: isSmallDevice ? 24 : 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  blogCard: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: isSmallDevice ? 16 : 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blogImageContainer: {
    width: '100%',
    height: isSmallDevice ? 200 : 280,
    position: 'relative',
  },
  blogImage: {
    width: '100%',
    height: '100%',
  },
  blogImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.errorRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blogContent: {
    padding: isSmallDevice ? 20 : 24,
  },
  blogTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 12,
    lineHeight: isSmallDevice ? 28 : 32,
    fontFamily: 'System',
  },
  blogDescription: {
    fontSize: isSmallDevice ? 14 : 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 16,
    fontFamily: 'System',
  },
  blogMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  ctaCard: {
    padding: isSmallDevice ? 24 : 32,
    borderRadius: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  ctaText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 500,
    fontFamily: 'System',
  },
});

export default BlogsList;