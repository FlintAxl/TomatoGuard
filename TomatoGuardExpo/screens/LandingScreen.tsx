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
};

// Combined disease data from Cloudinary links
const DISEASES = [
  // Fruit Diseases
  { id: 1, name: 'Anthracnose', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889106/anthracnose_kbwcut.png' },
  { id: 2, name: 'Botrytis Gray Mold', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/botrytisgraymold_gkwjvy.png' },
  { id: 3, name: 'Blossom End Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/blossomendrot_uym7do.png' },
  { id: 4, name: 'Buckeye Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889109/buckeyerot_heup6g.png' },
  { id: 5, name: 'Sunscald', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/sunscald_pfudlf.png' },
  { id: 6, name: 'Healthy Fruit', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890142/healthyfruit_gz98qz.jpg' },
  // Leaf Diseases
  { id: 7, name: 'Septoria Leaf Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/septorialeafspot_rjjgbw.png' },
  { id: 8, name: 'Bacterial Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889110/bacterialspot_svwbyu.png' },
  { id: 9, name: 'Early Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/earlyblight_fzng93.png' },
  { id: 10, name: 'Late Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890160/lateblightleaf_m6ov1l.jpg' },
  { id: 11, name: 'Yellow Leaf Curl', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/fusarium_gdkaek.png' },
  { id: 12, name: 'Healthy Leaf', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890144/healthystem_kwwg6j.jpg' },
  // Stem Diseases
  { id: 13, name: 'Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889112/dampingoff_i3hxbj.png' },
  { id: 14, name: 'Healthy Stem', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890396/cea78e54-9eec-4f00-b086-83736756a7c1.png' },
  { id: 15, name: 'Wilt', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889134/pithnecrosis_xce3ih.png' },
];

// Tech stack data
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
      // Handle logout
      console.log('Logout');
      return;
    }
    if (itemId === 'camera' || itemId === 'upload' || itemId === 'results' || itemId === 'forum' || itemId === 'profile') {
      // Navigate to main app
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
    // Navigate to Auth screen (Login)
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleLearnMore = () => {
    // Navigate to about screen
    // navigation.navigate('About');
    console.log('Navigate to about');
  };
  
  const handleBlogPress = (blogId: string) => {
    // Navigate to login first, then to the specific blog
    navigation.navigate('Auth', { screen: 'Login' });
  };
  
  const handleViewAllBlogs = () => {
    // Navigate to login first
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
      <View style={[
        styles.carouselItem, 
        isActive ? styles.carouselItemActive : null
      ].filter(Boolean)}>
        <Image source={{ uri: item.image }} style={styles.carouselImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.carouselGradient}
        />
        <Text style={styles.carouselText}>{item.name}</Text>
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
            {/* Section One - Hero */}
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770891055/section1-bg_fe4mif.png' }}
              style={styles.sectionOne}
              resizeMode="cover"
            >
              <LinearGradient
                colors={['transparent', COLORS.color4]}
                style={styles.heroGradient}
              />
              <View style={styles.heroContent}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770891117/SIA_ML_-_LOGO___TRADEMARK-removebg-preview_ilaacc.png' }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.heroTitle}>
                  Helping Farmers Grow Healthier Tomatoes
                </Text>
                <Text style={styles.heroSubtitle}>
                  An immersive forum for Tomato Growers, along with a function for taking care of our crops!
                </Text>
              </View>
              <View style={styles.contacts}>
                <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                  <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.contactText}>tomatoguard@gmail.com</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton} onPress={handlePhone}>
                  <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.contactText}>+63 123456789</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>

            {/* Section Two - Testimonial Card */}
            <View style={styles.sectionTwo}>
              <LinearGradient
                colors={[COLORS.color5, COLORS.color4]}
                style={styles.testimonialCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.testimonialLeft}>
                  <Text style={styles.testimonialText}>
                    Detect Diseases of your Tomatoes, in Real Time.
                  </Text>
                  <TouchableOpacity style={styles.learnMoreBtn} onPress={handleCheckNow}>
                    <Text style={styles.learnMoreBtnText}>Get Started</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.testimonialRight}>
                  <Image
                    source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770892841/tomato_wdfqx5.png' }}
                    style={styles.tomatoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Section Three - About */}
            <View style={styles.sectionThree}>
              <View style={styles.sectionThreeWrapper}>
                <View style={styles.visualArea}>
                  <View style={styles.imageCard}>
                    <Image
                      source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770891066/tomatofarmers_e4ay2v.png' }}
                      style={styles.farmersImage}
                      resizeMode="cover"
                    />
                  </View>
                  <LinearGradient
                    colors={[COLORS.color5, COLORS.color3]}
                    style={styles.experienceCard}
                  >
                    <Text style={styles.experienceNumber}>10+</Text>
                    <Text style={styles.experienceText}>
                      Diseases Detected{'\n'}& Prevented
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.contentArea}>
                  <Text style={styles.contentTitle}>
                    Where Plants Find{'\n'}Their People.
                  </Text>
                  <Text style={styles.contentText}>
                    This system is an AI-powered web application designed to help tomato
                    farmers detect fruit and leaf diseases early using image-based machine
                    learning. By analyzing images captured from multiple angles, the system
                    identifies possible diseases, suggests appropriate counteractive measures,
                    and provides timely email and in-app alerts. Through smart
                    technology and collaboration, the system aims to improve crop health,
                    reduce losses, and promote sustainable tomato farming.
                  </Text>
                  <TouchableOpacity style={styles.learnMoreBtn} onPress={handleLearnMore}>
                    <Text style={styles.learnMoreBtnText}>Learn More</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Section Four - Diseases Carousel */}
            <View style={styles.sectionFour}>
              <Text style={styles.sectionTitle}>Detect These Diseases</Text>
              <Text style={styles.sectionSubtitle}>
                The following diseases can severely affect your crops and overall harvest.
                Detect and prevent them early on.
              </Text>
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

            <View style={styles.sectionBlogs}>
              <Text style={styles.sectionTitle}>Latest Articles & Insights</Text>
              <Text style={styles.sectionSubtitle}>
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
                      <Image
                        source={{ uri: blog.image }}
                        style={styles.blogCardImage}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(8, 22, 0, 0.95)']}
                        style={styles.blogCardGradient}
                      />
                      <View style={styles.blogCategoryBadge}>
                        <Text style={styles.blogCategoryText}>{blog.category}</Text>
                      </View>
                    </View>
                    <View style={styles.blogCardContent}>
                      <Text style={styles.blogCardTitle} numberOfLines={2}>
                        {blog.title}
                      </Text>
                      <Text style={styles.blogCardDescription} numberOfLines={3}>
                        {blog.description}
                      </Text>
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

            {/* Section Five - Tech Stack */}
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
    backgroundColor: COLORS.color4,
  },
  // Section One - Hero
  sectionOne: {
    width: SCREEN_WIDTH,
    height: isSmallDevice ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 20,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    marginBottom: isSmallDevice ? 20 : 30,
  },
  logoImage: {
    width: isSmallDevice ? 150 : 800,
    height: isSmallDevice ? 80 : 300,
    marginBottom: isSmallDevice ? 8 : 12,
  },
  heroTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(28) : 56,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: isSmallDevice ? 12 : 16,
  },
  heroSubtitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: 'center',
    color: COLORS.textLight,
    paddingHorizontal: isSmallDevice ? 8 : 0,
  },
  contacts: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    borderRadius: 999,
  },
  contactText: {
    color: COLORS.textLight,
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'System',
  },
  // Section Two - Testimonial
  sectionTwo: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 30 : 40,
    paddingBottom: isSmallDevice ? 40 : 80,
    paddingTop: isSmallDevice ? 30 : 100,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },
  testimonialCard: {
    borderRadius: isSmallDevice ? 16 : 24,
    padding: isSmallDevice ? 20 : 30,
    flexDirection: isSmallDevice ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: isSmallDevice ? 'auto' : 280,
    width: isSmallDevice ? '100%' : 1000,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  testimonialLeft: {
    flex: 1,
    paddingRight: isSmallDevice ? 0 : 20,
    width: '100%',
  },
  testimonialText: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(20) : 38,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: isSmallDevice ? 'center' : 'left',
  },
  testimonialRight: {
    width: isSmallDevice ? '100%' : 500,
    height: isSmallDevice ? 200 : 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallDevice ? 20 : 0,
  },
  tomatoImage: {
    position: isSmallDevice ? 'relative' : 'absolute',
    bottom: isSmallDevice ? 0 : -100,
    right: isSmallDevice ? 0 : 10,
    width: isSmallDevice ? SCREEN_WIDTH * 0.6 : 400,
    height: isSmallDevice ? 200 : 280,
  },
  learnMoreBtn: {
    backgroundColor: COLORS.color2,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignSelf: isSmallDevice ? 'center' : 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  learnMoreBtnText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  // Section Three - About
  sectionThree: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingVertical: isSmallDevice ? 40 : 60,
    backgroundColor: COLORS.color4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionThreeWrapper: {
    gap: isSmallDevice ? 30 : 80,
    flexDirection: isSmallDevice ? 'column' : 'row',
    width: '100%',
    maxWidth: isSmallDevice ? '100%' : 1200,
  },
  visualArea: {
    position: 'relative',
    alignItems: isSmallDevice ? 'center' : 'flex-end',
    width: isSmallDevice ? '100%' : 'auto',
  },
  imageCard: {
    width: isSmallDevice ? '100%' : 600,
    height: isSmallDevice ? 250 : 380,
    borderRadius: isSmallDevice ? 16 : 24,
    overflow: 'hidden',
  },
  farmersImage: {
    width: '100%',
    height: '100%',
  },
  experienceCard: {
    position: 'absolute',
    bottom: isSmallDevice ? -15 : -20,
    right: isSmallDevice ? 10 : 20,
    width: isSmallDevice ? 100 : 120,
    height: isSmallDevice ? 100 : 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  experienceNumber: {
    fontSize: isSmallDevice ? 32 : 40,
    fontWeight: '700',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  experienceText: {
    fontSize: isSmallDevice ? 10 : 11,
    color: COLORS.textLight,
    textAlign: 'center',
    fontFamily: 'System',
  },
  contentArea: {
    paddingTop: isSmallDevice ? 20 : 30,
    width: isSmallDevice ? '100%' : 500,
  },
  contentTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(24) : 32,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: isSmallDevice ? 'center' : 'left',
  },
  contentText: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 20 : 22,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'justify',
  },
  // Section Four - Carousel
  sectionFour: {
    paddingVertical: isSmallDevice ? 40 : 60,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(24) : 32,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 0,
  },
  sectionSubtitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 30 : 40,
    paddingHorizontal: isSmallDevice ? 20 : 40,
  },
  diseasesList: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
    gap: ITEM_SPACING,
    paddingBottom: isSmallDevice ? 40 : 60,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    height: isSmallDevice ? 280 : 320,
    borderRadius: isSmallDevice ? 16 : 24,
    overflow: 'hidden',
    position: 'relative',
    opacity: 0.6,
    transform: [{ scale: 0.85 }],
  },
  carouselItemActive: {
    borderWidth: isSmallDevice ? 3 : 4,
    borderColor: COLORS.color5,
    opacity: 1,
    transform: [{ scale: 1 }],
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
    height: isSmallDevice ? 150 : 200,
  },
  carouselText: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  // Section Five - Tech Stack
  sectionFive: {
    paddingVertical: isSmallDevice ? 30 : 40,
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
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  // Section Blogs
  sectionBlogs: {
    paddingVertical: isSmallDevice ? 40 : 60,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },
  blogsContainer: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 20 : 24,
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 30 : 40,
    maxWidth: isSmallDevice ? '100%' : 1200,
  },
  blogCard: {
    width: isSmallDevice ? '100%' : 360,
    backgroundColor: COLORS.color5,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  blogImageWrapper: {
    width: '100%',
    height: isSmallDevice ? 180 : 220,
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  blogCardContent: {
    padding: isSmallDevice ? 16 : 20,
  },
  blogCardTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 10,
    lineHeight: isSmallDevice ? 22 : 24,
  },
  blogCardDescription: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  blogReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blogReadMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.color2,
    fontFamily: 'System',
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
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default LandingScreen;