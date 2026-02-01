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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  color1: '#f8ff76',
  color2: '#e9523a',
  color3: '#2d7736',
  color4: '#081600',
  color5: '#1b4e00',
  textLight: '#ffffff',
  muted: '#d6e4dd',
};

// Disease data
const DISEASES = [
  { id: 0, name: 'Early Blight', image: require('./../assets/diseases/earlyblight.jpg') },
  { id: 1, name: 'Anthracnose', image: require('./../assets/diseases/anthracnose.jpg') },
  { id: 2, name: 'Fusarium', image: require('./../assets/diseases/fusarium.jpg') },
  { id: 3, name: 'Powdery Mildew', image: require('./../assets/diseases/powderymilddew.jpg') },
  { id: 4, name: 'Septoria Leaf Spot', image: require('./../assets/diseases/septorialeafspot.jpg') },
  { id: 5, name: 'Botrytis Gray Mold', image: require('./../assets/diseases/botrytisgraymold.jpg') },
  { id: 6, name: 'Bacterial Speck', image: require('./../assets/diseases/bacterialspeck.jpg') },
  { id: 7, name: 'Blossom End Root', image: require('./../assets/diseases/blossomendrot.jpg') },
  { id: 8, name: 'Buckeye Rot', image: require('./../assets/diseases/buckeyerot.jpg') },
  { id: 9, name: 'Tomato Pith Necrosis', image: require('./../assets/diseases/pithnecrosis.jpg') },
  { id: 10, name: 'Damping Off', image: require('./../assets/diseases/dampingoff.jpg') },
  { id: 11, name: 'Sunscald', image: require('./../assets/diseases/sunscald.jpg') },
  { id: 12, name: 'Bacterial Spot', image: require('./../assets/diseases/bacterialspot.jpg') },
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

const ITEM_WIDTH = 240;
const ITEM_SPACING = 20;

const LandingScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (ITEM_WIDTH + ITEM_SPACING));
    setActiveSlide(index);
  };

  const renderDiseaseItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = index === activeSlide;
    return (
      <View style={[styles.carouselItem, isActive && styles.carouselItemActive]}>
        <Image source={item.image} style={styles.carouselImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.carouselGradient}
        />
        <Text style={styles.carouselText}>{item.name}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Section One - Hero */}
      <ImageBackground
        source={require('./../assets/bg1.jpg')}
        style={styles.sectionOne}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', COLORS.color4]}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
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
              source={require('./../assets/tomato1.jpg')}
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
                source={require('./../assets/bg1.jpg')}
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
          pagingEnabled={false}
        />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.color4,
  },
  // Section One - Hero
  sectionOne: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroTitle: {
    fontFamily: 'System',
    fontSize: 56,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: 'System',
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textLight,
  },
  contacts: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    fontSize: 12,
    fontFamily: 'System',
  },
  // Section Two - Testimonial
  sectionTwo: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 80,
    paddingTop: 100,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },
  testimonialCard: {
    borderRadius: 24,
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 280,
    width: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  testimonialLeft: {
    flex: 1,
    paddingRight: 20,
  },
  testimonialText: {
    fontFamily: 'System',
    fontSize: 38,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 20,
  },
  testimonialRight: {
    width: 500,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  tomatoImage: {
    position: 'absolute',
    objectFit: 'contain',
    bottom: -100,
    right: 10,
    width: 400,
    height: 280,
  },
  learnMoreBtn: {
    backgroundColor: COLORS.color2,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignSelf: 'flex-start',
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
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: COLORS.color4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  sectionThreeWrapper: {
    gap: 80,
    display: 'flex',
    flexDirection: 'row',
  },
  visualArea: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  imageCard: {
    width: 600,
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
  },
  farmersImage: {
    width: '100%',
    height: '100%',
  },
  experienceCard: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    width: 120,
    height: 120,
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
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  experienceText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    fontFamily: 'System',
  },
  contentArea: {
    paddingTop: 30,
    width: 500
  },
  contentTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 20,
  },
  contentText: {
    fontFamily: 'System',
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.muted,
    marginBottom: 24,
    textAlign: 'justify',
  },
  // Section Four - Carousel
  sectionFour: {
    paddingVertical: 60,
    backgroundColor: COLORS.color4,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  diseasesList: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
    gap: ITEM_SPACING,
    paddingBottom: 60,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    opacity: 0.6,
    transform: [{ scale: 0.85 }],
  },
  carouselItemActive: {
    borderWidth: 4,
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
    height: 200,
  },
  carouselText: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  // Section Five - Tech Stack
  sectionFive: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  techRibbon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  techText: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default LandingScreen;