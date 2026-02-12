import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  color1: '#f8ff76',
  color2: '#e9523a',
  color3: '#2d7736',
  color4: '#081600',
  color5: '#1b4e00',
  textLight: '#ffffff',
  muted: '#d6e4dd',
};

interface BlogsListProps {
  setActiveTab: (tab: string) => void;
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
    image: 'hhttps://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_xe9pbpxe9pbpxe9p_yaemwf.png',
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

const BlogsList: React.FC<BlogsListProps> = ({ setActiveTab, navigateToBlog }) => {
  const handleBlogPress = (blogId: string) => {
    navigateToBlog(blogId);
  };

  const handleBackToForum = () => {
    setActiveTab('forum');
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <LinearGradient
        colors={[COLORS.color5, COLORS.color3]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToForum}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textLight} />
            <Text style={styles.backButtonText}>Back to Forums</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TomatoGuard Blog</Text>
          <Text style={styles.headerSubtitle}>
            Expert insights on tomato cultivation, disease management, and health benefits
          </Text>
        </View>
      </LinearGradient>

      {/* Blog List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.blogListContainer}
      >
        {BLOGS.map((blog, index) => (
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
                  <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.metaText}>{blog.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.metaText}>{blog.readTime}</Text>
                </View>
              </View>

              <View style={styles.readMoreContainer}>
                <Text style={styles.readMoreText}>Read Article</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.color2} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Call to Action */}
        <LinearGradient
          colors={[COLORS.color5, COLORS.color3]}
          style={styles.ctaCard}
        >
          <Ionicons name="leaf-outline" size={48} color={COLORS.color1} />
          <Text style={styles.ctaTitle}>Stay Updated</Text>
          <Text style={styles.ctaText}>
            Join our community to receive the latest articles on tomato care, disease prevention, and farming best practices.
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    paddingTop: isSmallDevice ? 20 : 30,
    paddingBottom: isSmallDevice ? 30 : 40,
    paddingHorizontal: isSmallDevice ? 16 : 24,
  },
  headerContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 32 : 42,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: COLORS.muted,
    lineHeight: 24,
    fontFamily: 'System',
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
    backgroundColor: COLORS.color4,
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
    backgroundColor: COLORS.color2,
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
    color: COLORS.muted,
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
    color: COLORS.muted,
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
    color: COLORS.color2,
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
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 500,
    fontFamily: 'System',
  },
});

export default BlogsList;