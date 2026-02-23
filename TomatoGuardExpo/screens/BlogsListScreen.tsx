import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
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

interface BlogsListProps {
  navigateToBlog: (blogId: string) => void;
  setActiveTab?: (tab: string) => void;
}

const BLOGS = [
  {
    id: 'blogone',
    title: 'How to Identify, Treat, and Prevent Tomato Diseases',
    description:
      'A comprehensive guide to recognizing common tomato diseases, understanding their causes, and implementing effective treatment and prevention strategies.',
    image:
      'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_3xk5433xk5433xk5_qmc8ap.png',
    date: 'January 15, 2025',
    readTime: '8 min read',
    category: 'Disease Management',
  },
  {
    id: 'blogtwo',
    title: 'Tomatoes: Nutrition Facts and Health Benefits',
    description:
      'Discover the nutritional powerhouse that tomatoes are, including their vitamins, minerals, and powerful antioxidants that contribute to overall health.',
    image:
      'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_xe9pbpxe9pbpxe9p_yaemwf.png',
    date: 'January 20, 2025',
    readTime: '6 min read',
    category: 'Nutrition',
  },
  {
    id: 'blogthree',
    title: 'Health Benefits of Tomatoes: What You Need to Know',
    description:
      'Explore the incredible health benefits of tomatoes, from heart health to cancer prevention, and learn why this fruit deserves a place in your daily diet.',
    image:
      'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_ijcjf1ijcjf1ijcj_srnwqq.png',
    date: 'January 25, 2025',
    readTime: '7 min read',
    category: 'Health & Wellness',
  },
  {
    id: 'blogfour',
    title: 'The History of Tomato in the Kitchen',
    description: 'From ketchup to marinara — discover how the tomato transformed global cuisine through centuries of culinary discovery and innovation.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771769619/eb324c9c-6ee2-4820-88d3-a1b61f264340.png',
    date: 'February 1, 2025',
    readTime: '9 min read',
    category: 'Culinary History',
  },
  {
    id: 'blogfive',
    title: 'Different Species of Tomato: Origins, Science, and Where They Grow',
    description: 'Explore the remarkable diversity of tomato species — from wild Andean ancestors to protected Italian varieties — their scientific names and global growing regions.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771769877/39c35735-c63c-4432-9e2f-54d07f01436a.png',
    date: 'February 8, 2025',
    readTime: '10 min read',
    category: 'Botany & Species',
  },
  {
    id: 'blogsix',
    title: 'The Stages and Timelines of Growing a Tomato',
    description: 'A complete stage-by-stage guide to growing tomatoes — from seed germination through harvest — with the specific needs of the plant at every phase.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771770960/a4ac4b97-a677-47fc-bf48-8f2242cd531a.png',
    date: 'February 15, 2025',
    readTime: '11 min read',
    category: 'Growing Guide',
  },
];

// ── MOBILE CARD ──────────────────────────────────────────────────────────────
const MobileBlogCard = ({
  blog,
  onPress,
}: {
  blog: (typeof BLOGS)[0];
  onPress: () => void;
}) => (
  <TouchableOpacity style={mobileStyles.blogCard} onPress={onPress} activeOpacity={0.85}>
    <View style={mobileStyles.blogImageContainer}>
      <Image source={{ uri: blog.image }} style={mobileStyles.blogImage} resizeMode="cover" />
      <View style={mobileStyles.categoryBadge}>
        <Text style={mobileStyles.categoryText}>{blog.category}</Text>
      </View>
    </View>
    <View style={mobileStyles.blogContent}>
      <Text style={mobileStyles.blogTitle}>{blog.title}</Text>
      <Text style={mobileStyles.blogDescription} numberOfLines={3}>
        {blog.description}
      </Text>
      <View style={mobileStyles.blogMeta}>
        <View style={mobileStyles.metaItem}>
          <FontAwesome5 name="calendar-alt" size={12} color={COLORS.textMuted} />
          <Text style={mobileStyles.metaText}>{blog.date}</Text>
        </View>
        <View style={mobileStyles.metaItem}>
          <FontAwesome5 name="clock" size={12} color={COLORS.textMuted} />
          <Text style={mobileStyles.metaText}>{blog.readTime}</Text>
        </View>
      </View>
      <View style={mobileStyles.readMoreRow}>
        <Text style={mobileStyles.readMoreText}>Read Article</Text>
        <FontAwesome5 name="arrow-right" size={13} color={COLORS.limeglow} />
      </View>
    </View>
  </TouchableOpacity>
);

// ── WEB SLIDESHOW PANEL ──────────────────────────────────────────────────────
const WebSlideshow = ({
  activeBlog,
  activeIndex,
  onDotPress,
}: {
  activeBlog: (typeof BLOGS)[0];
  activeIndex: number;
  onDotPress: (index: number) => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevId = useRef(activeBlog.id);

  useEffect(() => {
    if (prevId.current !== activeBlog.id) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      prevId.current = activeBlog.id;
    }
  }, [activeBlog.id]);

  return (
    <View style={webStyles.slideshowPanel}>
      {/* Full bleed image */}
      <Image
        source={{ uri: activeBlog.image }}
        style={webStyles.slideshowImage}
        resizeMode="cover"
      />

      {/* Dark gradient overlay */}
      <View style={webStyles.slideshowGradient} />

      {/* Top label */}
      <View style={webStyles.slideshowTopLabel}>
        <View style={webStyles.topLabelAccent} />
        <Text style={webStyles.slideshowTopLabelText}>Tomato Articles</Text>
      </View>

      {/* Bottom content overlay */}
      <Animated.View style={[webStyles.slideshowContent, { opacity: fadeAnim }]}>
        <View style={webStyles.slideshowBadge}>
          <Text style={webStyles.slideshowBadgeText}>{activeBlog.category}</Text>
        </View>
        <Text style={webStyles.slideshowTitle}>{activeBlog.title}</Text>
        <Text style={webStyles.slideshowDescription} numberOfLines={3}>
          {activeBlog.description}
        </Text>
        <View style={webStyles.dotsRow}>
          {BLOGS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => onDotPress(i)}>
              <View style={[webStyles.dot, i === activeIndex && webStyles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

// ── WEB ARTICLE ROW ──────────────────────────────────────────────────────────
const WebArticleRow = ({
  blog,
  isActive,
  onPress,
  onHover,
}: {
  blog: (typeof BLOGS)[0];
  isActive: boolean;
  onPress: () => void;
  onHover: () => void;
}) => (
  <TouchableOpacity
    style={[webStyles.articleRow, isActive && webStyles.articleRowActive]}
    onPress={onPress}
    onPressIn={onHover}
    activeOpacity={0.85}
  >
    {/* Thumbnail */}
    <Image source={{ uri: blog.image }} style={webStyles.articleThumb} resizeMode="cover" />

    {/* Text info */}
    <View style={webStyles.articleInfo}>
      <View style={webStyles.articleCategoryRow}>
        <View style={[
          webStyles.articleCategoryDot,
          isActive && webStyles.articleCategoryDotActive,
        ]} />
        <Text style={[
          webStyles.articleCategory,
          isActive && webStyles.articleCategoryActive,
        ]}>
          {blog.category}
        </Text>
      </View>
      <Text style={[
        webStyles.articleTitle,
        isActive && webStyles.articleTitleActive,
      ]} numberOfLines={2}>
        {blog.title}
      </Text>
      <View style={webStyles.articleMeta}>
        <View style={webStyles.metaChip}>
          <FontAwesome5
            name="calendar-alt"
            size={10}
            color={isActive ? COLORS.accentGreen : COLORS.textMuted}
          />
          <Text style={[
            webStyles.articleMetaText,
            isActive && webStyles.articleMetaTextActive,
          ]}>
            {blog.date}
          </Text>
        </View>
        <View style={webStyles.metaDivider} />
        <View style={webStyles.metaChip}>
          <FontAwesome5
            name="clock"
            size={10}
            color={isActive ? COLORS.accentGreen : COLORS.textMuted}
          />
          <Text style={[
            webStyles.articleMetaText,
            isActive && webStyles.articleMetaTextActive,
          ]}>
            {blog.readTime}
          </Text>
        </View>
      </View>
    </View>

    {/* Arrow */}
    <View style={[webStyles.articleArrow, isActive && webStyles.articleArrowActive]}>
      <FontAwesome5
        name="chevron-right"
        size={11}
        color={isActive ? COLORS.textLight : COLORS.accentGreen}
      />
    </View>
  </TouchableOpacity>
);

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const BlogsList: React.FC<BlogsListProps> = ({ navigateToBlog }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isSmallDevice) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % BLOGS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ── MOBILE ───────────────────────────────────────────────────────────────
  if (isSmallDevice) {
    return (
      <View style={mobileStyles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={mobileStyles.listContainer}
        >
          {BLOGS.map(blog => (
            <MobileBlogCard
              key={blog.id}
              blog={blog}
              onPress={() => navigateToBlog(blog.id)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── WEB ──────────────────────────────────────────────────────────────────
  return (
    <View style={webStyles.container}>
      {/* LEFT — fixed slideshow */}
      <View style={webStyles.leftPanel}>
        <WebSlideshow
          activeBlog={BLOGS[activeIndex]}
          activeIndex={activeIndex}
          onDotPress={setActiveIndex}
        />
      </View>

      {/* RIGHT — scrollable article list */}
      <View style={webStyles.rightPanel}>
        {/* Header */}
        <View style={webStyles.rightHeader}>
          <View style={webStyles.rightHeaderAccent} />
          <View>
            <Text style={webStyles.rightHeaderTitle}>All Articles</Text>
            <Text style={webStyles.rightHeaderSub}>{BLOGS.length} articles available</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={webStyles.articleList}
        >
          {BLOGS.map((blog, index) => (
            <WebArticleRow
              key={blog.id}
              blog={blog}
              isActive={index === activeIndex}
              onPress={() => navigateToBlog(blog.id)}
              onHover={() => setActiveIndex(index)}
            />
          ))}

          <View style={webStyles.listFooter}>
            <FontAwesome5 name="seedling" size={13} color={COLORS.accentGreen} />
            <Text style={webStyles.listFooterText}>More articles coming soon. Stay tuned!</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// ── MOBILE STYLES ────────────────────────────────────────────────────────────
const mobileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },
  listContainer: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 16,
  },
  blogCard: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.medGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  blogImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  blogImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.errorRed,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  blogDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.limeglow,
    letterSpacing: 0.3,
  },
});

// ── WEB STYLES ───────────────────────────────────────────────────────────────
const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bgCream,
    overflow: 'hidden' as any,
  },

  // Left panel
  leftPanel: {
    width: '70%',
    height: SCREEN_HEIGHT - 180,
    backgroundColor: COLORS.darkGreen,
  },
  slideshowPanel: {
    flex: 1,
    position: 'relative',
  },
  slideshowImage: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  slideshowGradient: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,26,18,0.52)',
  },
  slideshowTopLabel: {
    position: 'absolute' as any,
    top: 28,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topLabelAccent: {
    width: 4,
    height: 26,
    borderRadius: 2,
    backgroundColor: COLORS.limeglow,
  },
  slideshowTopLabelText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 0.4,
    fontStyle: 'italic',
  },
  slideshowContent: {
    position: 'absolute' as any,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    paddingBottom: 36,
    backgroundColor: 'rgba(10,26,18,0.65)',
  },
  slideshowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentGreen,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.limeglow,
  },
  slideshowBadgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  slideshowTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 10,
    lineHeight: 32,
    fontStyle: 'italic',
  },
  slideshowDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 21,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.limeglow,
  },

  // Right panel
  rightPanel: {
    position: 'absolute' as any,
    top: 0,
    right: 0,
    bottom: 0,
    width: '45%',
    backgroundColor: COLORS.bgCream,
    flexDirection: 'column',
    overflow: 'hidden' as any,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.textLight,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.bgLight,
  },
  rightHeaderAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
    backgroundColor: COLORS.accentGreen,
  },
  rightHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  rightHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  articleList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
  },

  // Article row — image on left, text on right (matching reference image)
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
  },
  articleRowActive: {
    borderColor: COLORS.accentGreen,
    borderWidth: 2,
    backgroundColor: '#f0f7f2',
  },

  // Square thumbnail flush to the left edge
  articleThumb: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.bgLight,
    flexShrink: 0,
  },

  articleInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  articleCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleCategoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  articleCategoryDotActive: {
    backgroundColor: COLORS.accentGreen,
  },
  articleCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleCategoryActive: {
    color: COLORS.accentGreen,
  },
  articleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  articleTitleActive: {
    color: COLORS.darkGreen,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.bgLight,
  },
  articleMetaText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  articleMetaTextActive: {
    color: COLORS.accentGreen,
  },
  articleArrow: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.bgCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
    flexShrink: 0,
  },
  articleArrowActive: {
    backgroundColor: COLORS.accentGreen,
    borderColor: COLORS.accentGreen,
  },

  // Footer
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.bgLight,
    marginTop: 4,
  },
  listFooterText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

export default BlogsList;