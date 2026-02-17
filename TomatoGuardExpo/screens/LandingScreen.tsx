import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Linking,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import MainLayout from './../components/Layout/MainLayout';
import Drawer from '../components/Layout/Drawer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const isSmallDevice = SCREEN_WIDTH < 768;

const COLORS = {
  color1: '#f8ff76',
  color2: '#e9523a',
  color3: '#2d7736',
  color4: '#081600',
  color5: '#1b4e00',
  textLight: '#ffffff',
  muted: '#d6e4dd',
  // New design system colors
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52',
  textDark: '#0d1f14',
  textMuted: '#5a7a65',
  cardBg: '#1e3d2a',
  navBg: '#0d2018',
};

const DISEASES = [
  { id: 1, name: 'Anthracnose', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889106/anthracnose_kbwcut.png' },
  { id: 2, name: 'Botrytis Gray Mold', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/botrytisgraymold_gkwjvy.png' },
  { id: 3, name: 'Blossom End Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/blossomendrot_uym7do.png' },
  { id: 4, name: 'Buckeye Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889109/buckeyerot_heup6g.png' },
  { id: 5, name: 'Sunscald', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/sunscald_pfudlf.png' },
  { id: 6, name: 'Healthy Fruit', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890142/healthyfruit_gz98qz.jpg' },
  { id: 7, name: 'Septoria Leaf Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/septorialeafspot_rjjgbw.png' },
  { id: 8, name: 'Bacterial Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889110/bacterialspot_svwbyu.png' },
  { id: 9, name: 'Early Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/earlyblight_fzng93.png' },
  { id: 10, name: 'Late Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890160/lateblightleaf_m6ov1l.jpg' },
  { id: 11, name: 'Yellow Leaf Curl', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/fusarium_gdkaek.png' },
  { id: 12, name: 'Healthy Leaf', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890144/healthystem_kwwg6j.jpg' },
  { id: 13, name: 'Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889112/dampingoff_i3hxbj.png' },
  { id: 14, name: 'Healthy Stem', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890396/cea78e54-9eec-4f00-b086-83736756a7c1.png' },
  { id: 15, name: 'Wilt', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889134/pithnecrosis_xce3ih.png' },
];

const TECH_STACK = [
  { name: 'React', icon: 'logo-react' },
  { name: 'CSS', icon: 'logo-css3' },
  { name: 'TensorFlow', icon: 'hardware-chip' },
  { name: 'NPM', icon: 'cube' },
  { name: 'Node.js', icon: 'logo-nodejs' },
  { name: 'MongoDB', icon: 'server' },
];

const BLOGS = [
  {
    id: 'blogone',
    title: 'How to Identify, Treat, and Prevent Tomato Diseases',
    description: 'A comprehensive guide to recognizing common tomato diseases and implementing effective prevention strategies.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_3xk5433xk5433xk5_qmc8ap.png',
    category: 'Disease Management',
  },
  {
    id: 'blogtwo',
    title: 'Tomatoes: Nutrition Facts and Health Benefits',
    description: 'Discover the nutritional powerhouse that tomatoes are, including their vitamins, minerals, and antioxidants.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_xe9pbpxe9pbpxe9p_yaemwf.png',
    category: 'Nutrition',
  },
  {
    id: 'blogthree',
    title: 'Health Benefits of Tomatoes: What You Need to Know',
    description: 'Explore the incredible health benefits of tomatoes, from heart health to cancer prevention.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_ijcjf1ijcjf1ijcj_srnwqq.png',
    category: 'Health & Wellness',
  },
];

// Disease category grid cards (matching the Indoor Collection grid in reference)
const DISEASE_CATEGORIES = [
  {
    id: 'fruit',
    label: 'Fruit Diseases',
    desc: 'Anthracnose, Blossom End Rot, Buckeye Rot and more affect the fruit directly — detect early.',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889106/anthracnose_kbwcut.png',
  },
  {
    id: 'leaf',
    label: 'Leaf Diseases',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889110/bacterialspot_svwbyu.png',
  },
  {
    id: 'stem',
    label: 'Stem Diseases',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889112/dampingoff_i3hxbj.png',
  },
  {
    id: 'healthy',
    label: 'Healthy Plants',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890142/healthyfruit_gz98qz.jpg',
  },
];

const ITEM_WIDTH = isSmallDevice ? SCREEN_WIDTH * 0.75 : 240;
const ITEM_SPACING = isSmallDevice ? 15 : 20;

const LandingScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleMenuPress = () => {
    setDrawerOpen(!drawerOpen);
    Animated.spring(drawerAnimation, {
      toValue: drawerOpen ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    Animated.spring(drawerAnimation, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const handleNavItemPress = (itemId: string) => {
    if (itemId === 'logout') {
      console.log('Logout');
      return;
    }
    if (itemId === 'camera' || itemId === 'upload' || itemId === 'results' || itemId === 'forum' || itemId === 'profile') {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    handleCloseDrawer();
  };

  const handleEmail = () => {
    Linking.openURL('mailto:tomatoguard@gmail.com');
  };

  const handlePhone = () => {
    Linking.openURL('tel:+63123456789');
  };

  const handleCheckNow = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleLearnMore = () => {
    console.log('Navigate to about');
  };

  const handleBlogPress = (blogId: string) => {
    switch (blogId) {
      case 'blogone':
        navigation.navigate('BlogOne');
        break;
      case 'blogtwo':
        navigation.navigate('BlogTwo');
        break;
      case 'blogthree':
        navigation.navigate('BlogThree');
        break;
      default:
        console.log('Unknown blog ID');
    }
  };

  const handleViewAllBlogs = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (ITEM_WIDTH + ITEM_SPACING));
    setActiveSlide(index);
  };

  const renderDiseaseItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = index === activeSlide;
    return (
      <View style={[styles.carouselItem, isActive && styles.carouselItemActive]}>
        <Image source={{ uri: item.image }} style={styles.carouselImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.carouselGradient}
        />
        <Text style={styles.carouselText}>{item.name}</Text>
        {isActive && (
          <TouchableOpacity style={styles.carouselArrow} onPress={handleCheckNow}>
            <Ionicons name="arrow-forward" size={16} color={COLORS.textDark} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={localStyles.container}>
      <MainLayout
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        pageTitle="TomatoGuard"
        pageSubtitle="Disease Detection & Prevention"
        onMenuPress={handleMenuPress}
        onCloseDrawer={handleCloseDrawer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            {/* ─── HERO SECTION ─── */}
            <View style={styles.heroSection}>
              {/* Left teal/green sidebar accent */}
              <View style={styles.heroAccentBar} />

              {/* Hero inner rounded card — dark green, like the reference */}
              <View style={styles.heroCard}>
                <ImageBackground
                  source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771333800/Screen_Shot_2026-02-17_at_9.09.39_PM_o8nvq8.png' }}
                  style={styles.heroCardBg}
                  resizeMode="cover"
                  imageStyle={{ borderRadius: isSmallDevice ? 20 : 28 }}
                >
                  {/* Hero body */}
                  <View style={styles.heroBody}>
                    {/* Stats badge */}
                    <View style={styles.heroStatsBadge}>
                      <View style={styles.heroStatsLeft}>
                        <Text style={styles.heroStatsNumber}>15+</Text>
                        <Text style={styles.heroStatsLabel}>
                          Diseases{'\n'}Detected
                        </Text>
                      </View>
                      <Image
                        source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890142/healthyfruit_gz98qz.jpg' }}
                        style={styles.heroStatsImage}
                      />
                    </View>

                    <TouchableOpacity style={styles.heroShopBtn} onPress={handleCheckNow}>
                      <Text style={styles.heroShopBtnText}>Scan tomatoes</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            </View>

            {/* ─── "NEW PLANTS" → "NEW DETECTIONS" SECTION ─── */}
            <View style={styles.newPlantsSection}>
              <View style={styles.newPlantsHeader}>
                <Text style={styles.newPlantsTitle}>New Detections</Text>
                <Text style={styles.newPlantsDesc}>
                  Identify and treat the latest tomato diseases affecting crops, including fruit,
                  leaf, and stem conditions — all in real time.
                </Text>
              </View>

              {/* 3-card row */}
              <View style={styles.newPlantsCards}>
                {DISEASES.slice(0, 3).map((disease) => (
                  <View key={disease.id} style={styles.newPlantCard}>
                    <View style={styles.newPlantCardImageWrap}>
                      <Image source={{ uri: disease.image }} style={styles.newPlantCardImage} resizeMode="cover" />
                      <TouchableOpacity style={styles.heartBtn}>
                        <Ionicons name="heart-outline" size={14} color={COLORS.textDark} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.newPlantCardName}>{disease.name}</Text>
                    <Text style={styles.newPlantCardMeta}>Fungal · Contagious</Text>
                    <View style={styles.newPlantCardBottom}>
                      <Text style={styles.newPlantCardAction}>View Details</Text>
                      <TouchableOpacity style={styles.newPlantCardArrow} onPress={handleCheckNow}>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.textLight} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pagination dots */}
              <View style={styles.paginationDots}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.paginationDot, i === 2 && styles.paginationDotActive]} />
                ))}
              </View>
            </View>

            {/* ─── VIDEO / INDOOR COLLECTION → DISEASE CATEGORY GRID ─── */}
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryHeaderLeft}>
                  Check out our detection tools including AI-powered diagnostics where you can learn more about your tomato crops.
                </Text>
                <Text style={styles.categoryHeaderTitle}>Disease{'\n'}Collection</Text>
              </View>

              {/* 2×2 grid of category cards */}
              <View style={styles.categoryGrid}>
                {DISEASE_CATEGORIES.map((cat, idx) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      idx === 0 && styles.categoryCardTall,
                    ]}
                    onPress={handleCheckNow}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: cat.image }} style={styles.categoryCardImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(10,26,16,0.88)']}
                      style={styles.categoryCardGradient}
                    />
                    <View style={styles.categoryCardContent}>
                      {idx === 0 && cat.desc ? (
                        <Text style={styles.categoryCardDesc}>{cat.desc}</Text>
                      ) : null}
                      <Text style={styles.categoryCardLabel}>{cat.label}</Text>
                    </View>
                    <View style={styles.categoryCardArrow}>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.textDark} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── QUALITY PLANTS → ABOUT SECTION ─── */}
            <View style={styles.qualitySection}>
              <Text style={styles.qualityTitle}>
                Smart Tomato{'\n'}Health, Powered by AI.
              </Text>
              <Text style={styles.qualityDesc}>
                We offer a carefully curated set of AI detection tools for fruit and leaf diseases,
                real-time alerts, and a grower community — all designed to protect your harvest.
              </Text>

              {/* Video-style hero image */}
              <View style={styles.qualityImageWrap}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771334724/tomato_gif_cb8hxx.gif' }}
                  style={styles.qualityImage}
                  resizeMode="cover"
                />
                <View style={styles.qualityPlayBtn}>
                  <Ionicons name="play" size={28} color={COLORS.textDark} />
                </View>
              </View>
            </View>

            {/* ─── FILTER TABS + DISEASE TYPES (replaces plain carousel) ─── */}
            <View style={styles.filterSection}>
              <View style={styles.filterTabs}>
                {['All Diseases', 'Fruit', 'Leaf', 'Stem'].map((tab, i) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterTab, i === 0 && styles.filterTabActive]}
                  >
                    <Text style={[styles.filterTabText, i === 0 && styles.filterTabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.seeAllBtn} onPress={handleCheckNow}>
                  <Text style={styles.seeAllBtnText}>See All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                ref={flatListRef}
                data={DISEASES}
                renderItem={renderDiseaseItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                decelerationRate="fast"
                contentContainerStyle={styles.diseasesList}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            </View>

            {/* ─── PET FRIENDLY / CATEGORY CARDS → HIGHLIGHT CARDS ─── */}
            <View style={styles.highlightSection}>
              {/* Large card */}
              <TouchableOpacity style={styles.highlightCardLarge} onPress={handleCheckNow} activeOpacity={0.85}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889106/anthracnose_kbwcut.png' }}
                  style={styles.highlightCardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(8,22,0,0.92)']}
                  style={styles.highlightCardGradient}
                />
                <View style={styles.highlightCardBody}>
                  <Text style={styles.highlightCardTitle}>Fruit Diseases</Text>
                  <Text style={styles.highlightCardDesc}>
                    There are many tomato fruit diseases that can devastate your harvest.
                    Learn to detect and treat them early using our AI scanner.
                  </Text>
                </View>
                <View style={styles.highlightCardArrow}>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.textDark} />
                </View>
                <View style={styles.highlightCardBadge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>Fungal</Text>
                </View>
              </TouchableOpacity>

              {/* Two small cards */}
              <View style={styles.highlightSmallRow}>
                {[
                  { label: 'Leaf\nDiseases', img: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889110/bacterialspot_svwbyu.png', badge: 'Bacterial' },
                  { label: 'Stem\nDiseases', img: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889112/dampingoff_i3hxbj.png', badge: 'Fungal' },
                ].map((item) => (
                  <TouchableOpacity key={item.label} style={styles.highlightCardSmall} onPress={handleCheckNow} activeOpacity={0.85}>
                    <Image source={{ uri: item.img }} style={styles.highlightCardImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(8,22,0,0.88)']}
                      style={styles.highlightCardGradient}
                    />
                    <Text style={styles.highlightCardSmallTitle}>{item.label}</Text>
                    <View style={styles.highlightCardArrow}>
                      <Ionicons name="arrow-forward" size={16} color={COLORS.textDark} />
                    </View>
                    <View style={styles.highlightCardBadge}>
                      <View style={styles.badgeDot} />
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ─── BLOGS SECTION ─── */}
            <View style={styles.blogsSection}>
              <Text style={styles.blogsSectionTitle}>Latest Articles & Insights</Text>
              <Text style={styles.blogsSectionSub}>
                Expert advice on tomato cultivation, disease management, and health benefits
              </Text>

              <View style={styles.blogsContainer}>
                {BLOGS.map((blog) => (
                  <TouchableOpacity
                    key={blog.id}
                    style={styles.blogCard}
                    onPress={() => handleBlogPress(blog.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.blogImageWrapper}>
                      <Image source={{ uri: blog.image }} style={styles.blogCardImage} resizeMode="cover" />
                      <LinearGradient
                        colors={['transparent', 'rgba(8, 22, 0, 0.95)']}
                        style={styles.blogCardGradient}
                      />
                      <View style={styles.blogCategoryBadge}>
                        <Text style={styles.blogCategoryText}>{blog.category}</Text>
                      </View>
                    </View>
                    <View style={styles.blogCardContent}>
                      <Text style={styles.blogCardTitle} numberOfLines={2}>{blog.title}</Text>
                      <Text style={styles.blogCardDescription} numberOfLines={3}>{blog.description}</Text>
                      <View style={styles.blogReadMore}>
                        <Text style={styles.blogReadMoreText}>Read Article</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.color2} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.viewAllBtn} onPress={handleViewAllBlogs}>
                <Text style={styles.viewAllBtnText}>View All Articles</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

            {/* ─── CONTACT STRIP ─── */}
            <View style={styles.contactStrip}>
              <TouchableOpacity style={styles.contactStripBtn} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.contactStripText}>tomatoguard@gmail.com</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactStripBtn} onPress={handlePhone}>
                <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.contactStripText}>+63 123456789</Text>
              </TouchableOpacity>
            </View>

            {/* ─── TECH STACK ─── */}
            <LinearGradient colors={[COLORS.color5, COLORS.color3]} style={styles.sectionFive}>
              <View style={styles.techRibbon}>
                {TECH_STACK.map((tech, index) => (
                  <View key={index} style={styles.techItem}>
                    <Ionicons name={tech.icon as any} size={32} color={COLORS.textLight} />
                    <Text style={styles.techText}>{tech.name}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

          </View>
        </ScrollView>
      </MainLayout>

      <Drawer
        activeTab="landing"
        onItemPress={handleNavItemPress}
        animation={drawerAnimation}
        drawerOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },

  // ─── HERO ───
  heroSection: {
    backgroundColor: COLORS.bgCream,
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: isSmallDevice ? 12 : 20,
    paddingTop: isSmallDevice ? 12 : 20,
    paddingBottom: isSmallDevice ? 20 : 32,
    gap: 0,
  },
  heroAccentBar: {
    width: isSmallDevice ? 8 : 12,
    backgroundColor: COLORS.accentGreen,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    marginRight: isSmallDevice ? 8 : 12,
    minHeight: isSmallDevice ? 460 : 560,
  },
  heroCard: {
    flex: 1,
    borderRadius: isSmallDevice ? 20 : 28,
    overflow: 'hidden',
    minHeight: isSmallDevice ? 460 : 560,
  },
  heroCardBg: {
    flex: 1,
    minHeight: isSmallDevice ? 460 : 560,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: isSmallDevice ? 20 : 28,
  },

  // Nav inside hero
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingTop: isSmallDevice ? 16 : 20,
    paddingBottom: 8,
  },
  heroNavLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBrandText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
  },
  heroNavRight: {
    flexDirection: 'row',
    gap: isSmallDevice ? 4 : 6,
    flexWrap: 'wrap',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: isSmallDevice ? 8 : 12,
    borderRadius: 999,
  },
  navItemActive: {
    backgroundColor: COLORS.textLight,
  },
  navItemText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 11 : 13,
    fontWeight: '500',
  },
  navItemActiveText: {
    color: COLORS.textDark,
    fontWeight: '700',
  },

  // Hero body
  heroBody: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 16 : 28,
    paddingBottom: isSmallDevice ? 20 : 32,
    paddingTop: isSmallDevice ? 24 : 32,
    justifyContent: 'flex-end',
  },
  heroEyebrow: {
    color: COLORS.muted,
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '400',
    marginBottom: 4,
  },
  heroGiantTitle: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? scale(64) : 96,
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: isSmallDevice ? scale(66) : 98,
    marginBottom: 12,
    letterSpacing: -2,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: isSmallDevice ? 12 : 14,
    lineHeight: 20,
    maxWidth: 380,
    marginBottom: 24,
  },
  heroStatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'flex-start',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroStatsLeft: {
    gap: 2,
  },
  heroStatsNumber: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '800',
  },
  heroStatsLabel: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  heroStatsImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  heroShopBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  heroShopBtnText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ─── NEW DETECTIONS ───
  newPlantsSection: {
    backgroundColor: COLORS.bgCream,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 32 : 48,
  },
  newPlantsHeader: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isSmallDevice ? 'flex-start' : 'flex-end',
    marginBottom: isSmallDevice ? 24 : 32,
    gap: isSmallDevice ? 8 : 0,
  },
  newPlantsTitle: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? scale(34) : 52,
    fontWeight: '900',
    lineHeight: isSmallDevice ? scale(36) : 54,
    letterSpacing: -1.5,
    fontStyle: 'italic',
  },
  newPlantsDesc: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 20,
    maxWidth: 260,
    textAlign: isSmallDevice ? 'left' : 'right',
  },
  newPlantsCards: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    gap: isSmallDevice ? 16 : 20,
    marginBottom: 24,
  },
  newPlantCard: {
    flex: isSmallDevice ? undefined : 1,
    backgroundColor: COLORS.textLight,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  newPlantCardImageWrap: {
    width: '100%',
    height: isSmallDevice ? 160 : 200,
    position: 'relative',
  },
  newPlantCardImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  newPlantCardName: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  newPlantCardMeta: {
    color: COLORS.textMuted,
    fontSize: 11,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  newPlantCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  newPlantCardAction: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
  },
  newPlantCardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.textDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pagination
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgLight,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: COLORS.textDark,
  },

  // ─── CATEGORY SECTION ───
  categorySection: {
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 32 : 48,
  },
  categoryHeader: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    gap: isSmallDevice ? 12 : 40,
    alignItems: isSmallDevice ? 'flex-start' : 'center',
    marginBottom: isSmallDevice ? 24 : 32,
  },
  categoryHeaderLeft: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 20,
    flex: isSmallDevice ? undefined : 1,
    maxWidth: isSmallDevice ? '100%' : 260,
  },
  categoryHeaderTitle: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? scale(38) : 64,
    fontWeight: '900',
    letterSpacing: -2,
    fontStyle: 'italic',
    lineHeight: isSmallDevice ? scale(40) : 68,
    flex: isSmallDevice ? undefined : 2,
    textAlign: isSmallDevice ? 'left' : 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 10 : 14,
  },
  categoryCard: {
    width: isSmallDevice ? '47%' : '47%',
    height: isSmallDevice ? 160 : 200,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryCardTall: {
    height: isSmallDevice ? 200 : 260,
  },
  categoryCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  categoryCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryCardContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 44,
  },
  categoryCardDesc: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 6,
  },
  categoryCardLabel: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 16 : 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  categoryCardArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── QUALITY SECTION ───
  qualitySection: {
    backgroundColor: COLORS.bgCream,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 40 : 64,
    alignItems: 'center',
  },
  qualityTitle: {
    color: COLORS.textDark,
    fontSize: isSmallDevice ? scale(34) : 56,
    fontWeight: '900',
    letterSpacing: -2,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: isSmallDevice ? scale(38) : 62,
  },
  qualityDesc: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 13 : 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 32,
  },
  qualityImageWrap: {
    width: '100%',
    maxWidth: 560,
    height: isSmallDevice ? 220 : 320,
    borderRadius: isSmallDevice ? 20 : 28,
    overflow: 'hidden',
    position: 'relative',
  },
  qualityImage: {
    width: '100%',
    height: '100%',
  },
  qualityPlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // ─── FILTER + CAROUSEL ───
  filterSection: {
    backgroundColor: COLORS.bgCream,
    paddingVertical: isSmallDevice ? 32 : 48,
  },
  filterTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    gap: isSmallDevice ? 6 : 10,
    marginBottom: isSmallDevice ? 20 : 28,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.bgLight,
    backgroundColor: COLORS.textLight,
  },
  filterTabActive: {
    backgroundColor: COLORS.textDark,
    borderColor: COLORS.textDark,
  },
  filterTabText: {
    color: COLORS.textMuted,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: COLORS.textLight,
  },
  seeAllBtn: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: COLORS.textDark,
  },
  seeAllBtnText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
  },

  // Carousel
  diseasesList: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
    gap: ITEM_SPACING,
    paddingBottom: isSmallDevice ? 16 : 24,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    height: isSmallDevice ? 260 : 300,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    position: 'relative',
    opacity: 0.65,
    transform: [{ scale: 0.88 }],
  },
  carouselItemActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: isSmallDevice ? 130 : 160,
  },
  carouselText: {
    position: 'absolute',
    bottom: isSmallDevice ? 42 : 50,
    left: 14,
    right: 14,
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -0.5,
  },
  carouselArrow: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── HIGHLIGHT CARDS ───
  highlightSection: {
    backgroundColor: COLORS.bgCream,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 32 : 48,
    gap: isSmallDevice ? 12 : 16,
  },
  highlightCardLarge: {
    width: '100%',
    height: isSmallDevice ? 220 : 280,
    borderRadius: isSmallDevice ? 20 : 24,
    overflow: 'hidden',
    position: 'relative',
  },
  highlightSmallRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 12 : 16,
  },
  highlightCardSmall: {
    flex: 1,
    height: isSmallDevice ? 160 : 200,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    position: 'relative',
  },
  highlightCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  highlightCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  highlightCardBody: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 52,
  },
  highlightCardTitle: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  highlightCardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    lineHeight: 16,
  },
  highlightCardSmallTitle: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 48,
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 18 : 21,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  highlightCardArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightCardBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7dff8a',
  },
  badgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '600',
  },

  // ─── BLOGS ───
  blogsSection: {
    paddingVertical: isSmallDevice ? 40 : 60,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    backgroundColor: COLORS.textDark,
    alignItems: 'center',
  },
  blogsSectionTitle: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? scale(28) : 40,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -1,
  },
  blogsSectionSub: {
    color: COLORS.muted,
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 28 : 36,
    paddingHorizontal: isSmallDevice ? 10 : 40,
  },
  blogsContainer: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 16 : 20,
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 28 : 36,
    maxWidth: isSmallDevice ? '100%' : 1200,
  },
  blogCard: {
    width: isSmallDevice ? '100%' : 340,
    backgroundColor: COLORS.color5,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blogImageWrapper: {
    width: '100%',
    height: isSmallDevice ? 180 : 210,
    position: 'relative',
  },
  blogCardImage: {
    width: '100%',
    height: '100%',
  },
  blogCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  blogCategoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.color2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  blogCategoryText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blogCardContent: {
    padding: isSmallDevice ? 16 : 20,
  },
  blogCardTitle: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: isSmallDevice ? 21 : 23,
  },
  blogCardDescription: {
    color: COLORS.muted,
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  blogReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blogReadMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.color2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.color2,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewAllBtnText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '700',
  },

  // ─── CONTACT STRIP ───
  contactStrip: {
    backgroundColor: COLORS.textDark,
    flexDirection: isSmallDevice ? 'column' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: isSmallDevice ? 20 : 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  contactStripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
  },
  contactStripText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 12 : 13,
  },

  // ─── TECH STACK ───
  sectionFive: {
    paddingVertical: isSmallDevice ? 28 : 40,
    paddingHorizontal: isSmallDevice ? 16 : 20,
  },
  techRibbon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isSmallDevice ? 20 : 30,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  techText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default LandingScreen;