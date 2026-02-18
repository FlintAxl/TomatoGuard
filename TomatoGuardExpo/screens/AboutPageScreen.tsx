import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const isSmallDevice = SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;

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
  lightGreen: '#4a8b5c',
  darkText: '#0a1a12',
};

// Research Proprietors
const TEAM_MEMBERS = [
  { id: 1, name: 'Flint Axl Celetaria', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770887048/idflint_zotvmt.jpg' },
  { id: 2, name: 'Emma Rose Pascua', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770887044/idemma_josayh.jpg' },
  { id: 3, name: 'Matthew Hernandez', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770887044/idmatt_m0hdcg.jpg' },
  { id: 4, name: 'Jemuel Malaga', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770887044/idjem_tr3oyc.jpg' },
];

// Fruit Diseases
const FRUIT_DISEASES = [
  { id: 1, name: 'Anthracnose', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889106/anthracnose_kbwcut.png' },
  { id: 5, name: 'Botrytis Gray Mold', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/botrytisgraymold_gkwjvy.png' },
  { id: 7, name: 'Blossom End Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/blossomendrot_uym7do.png' },
  { id: 8, name: 'Buckeye Rot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889109/buckeyerot_heup6g.png' },
  { id: 12, name: 'Sunscald', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/sunscald_pfudlf.png' },
  { id: 13, name: 'Healthy', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890142/healthyfruit_gz98qz.jpg' },
];

// Leaf Diseases
const LEAF_DISEASES = [
  { id: 4, name: 'Septoria Leaf Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889435/septorialeafspot_rjjgbw.png' },
  { id: 13, name: 'Bacterial Spot', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889110/bacterialspot_svwbyu.png' },
  { id: 14, name: 'Early Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889113/earlyblight_fzng93.png' },
  { id: 15, name: 'Late Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890160/lateblightleaf_m6ov1l.jpg' },
  { id: 2, name: 'Yellow Leaf Curl', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889116/fusarium_gdkaek.png' },
  { id: 1, name: 'Healthy', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890144/healthystem_kwwg6j.jpg' },
];

// Stem Diseases
const STEM_DISEASES = [
  { id: 1, name: 'Blight', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889112/dampingoff_i3hxbj.png' },
  { id: 2, name: 'Healthy', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890396/cea78e54-9eec-4f00-b086-83736756a7c1.png' },
  { id: 3, name: 'Wilt', image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770889134/pithnecrosis_xce3ih.png' },
];

// Tech Stack
const TECH_STACK = [
  { category: 'Frontend', tech: 'React Native Expo', icon: 'mobile-alt' },
  { category: 'Backend', tech: 'FastAPI', icon: 'server' },
  { category: 'Machine Learning', tech: 'TensorFlow, MobileNet', icon: 'brain' },
];

const AboutPageScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={[COLORS.darkGreen, COLORS.medGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <FontAwesome5 name="leaf" size={isSmallDevice ? 40 : 50} color={COLORS.limeglow} />
            </View>
            <Text style={styles.heroLabel}>RESEARCH TITLE</Text>
            <Text style={styles.heroTitle}>
              TomatoGuard: An Online AI-Powered Disease Detection and Decision Support System for Tomato Growers in the Philippines
            </Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroSubtext}>
              Empowering Filipino Farmers with AI Technology
            </Text>
          </View>
        </LinearGradient>

        {/* Introduction Section */}
        <View style={styles.introSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Introduction</Text>
          </View>
          
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              The Philippines harbors a significant food and food source, tomato farming. Nevertheless, tomato farmers usually have to deal with issues related to disease of the fruits and leaves, which greatly affect quality and yield of crop products. Such diseases are commonly not easy to diagnose early on, particularly when applied in the context of small-scale farmers who also rely on manual observation and are simply not easily exposed to agricultural specialists; manual methods may be sluggish, imprecise, and flawed.
            </Text>
            <Text style={styles.introText}>
              The development of machine learning is offering a chance to enhance disease detection in agriculture. Machine learning and deep learning systems based on images can process images of tomato leaves and plants to detect symptoms of diseases with a high degree of accuracy and efficiency without depending on trained specialists and being able to intervene earlier. It has been demonstrated that deep learning architectures with Convolutional Neural Networks, as well as Vision Transformer variants, are useful in identifying and classifying real agricultural-related diseases and their detection. These technologies can allow the early diagnosis of the disease, which will allow farmers to implement appropriate countermeasures before the disease gets out of control and hence enhance crop management and sustainability.
            </Text>
            <Text style={styles.introText}>
              This paper suggests a machine learning-powered system of tomato fruit and leaf disease detection, alerted through emails and an in-app notification system that will notify the farmers on the identified diseases and preventive measures. This system also comes with a forum whereby tomato farmers can exchange their experiences and knowledge. By so doing, the study will observe better disease management, enhanced productivity, and sustainable tomato farming in Philippines.
            </Text>
          </View>
        </View>

        {/* Research Proprietors Section */}
        <View style={styles.teamSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Research Proprietors</Text>
          </View>
          
          <View style={styles.teamGrid}>
            {TEAM_MEMBERS.map((member) => (
              <View key={member.id} style={styles.teamCard}>
                <Image
                  source={{ uri: member.image }}
                  style={styles.teamImage}
                />
                <LinearGradient
                  colors={['transparent', COLORS.darkGreen]}
                  style={styles.teamGradient}
                />
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <View style={styles.teamRoleBadge}>
                    <FontAwesome5 name="user-graduate" size={10} color={COLORS.limeglow} />
                    <Text style={styles.teamRoleText}>Researcher</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Supported Diseases Section */}
        <LinearGradient
          colors={[COLORS.darkGreen, COLORS.medGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.diseasesSection}
        >
          <View style={styles.sectionHeaderLight}>
            <View style={styles.sectionAccentLight} />
            <Text style={styles.sectionTitleLight}>Supported Diseases</Text>
          </View>

          {/* Fruit Diseases */}
          <View style={styles.diseaseCategory}>
            <View style={styles.categoryHeader}>
              <FontAwesome5 name="apple-alt" size={16} color={COLORS.textLight} />
              <Text style={styles.categoryTitle}>FRUIT DISEASES</Text>
            </View>
            <View style={styles.diseaseGrid}>
              {FRUIT_DISEASES.map((disease) => (
                <View key={disease.id} style={styles.diseaseCard}>
                  <Image
                    source={{ uri: disease.image }}
                    style={styles.diseaseImage}
                  />
                  <LinearGradient
                    colors={['transparent', COLORS.darkGreen]}
                    style={styles.diseaseGradient}
                  />
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Leaf Diseases */}
          <View style={styles.diseaseCategory}>
            <View style={styles.categoryHeader}>
              <FontAwesome5 name="leaf" size={16} color={COLORS.textLight} />
              <Text style={styles.categoryTitle}>LEAF DISEASES</Text>
            </View>
            <View style={styles.diseaseGrid}>
              {LEAF_DISEASES.map((disease) => (
                <View key={disease.id} style={styles.diseaseCard}>
                  <Image
                    source={{ uri: disease.image }}
                    style={styles.diseaseImage}
                  />
                  <LinearGradient
                    colors={['transparent', COLORS.darkGreen]}
                    style={styles.diseaseGradient}
                  />
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stem Diseases */}
          <View style={styles.diseaseCategory}>
            <View style={styles.categoryHeader}>
              <FontAwesome5 name="tree" size={16} color={COLORS.textLight} />
              <Text style={styles.categoryTitle}>STEM DISEASES</Text>
            </View>
            <View style={styles.diseaseGrid}>
              {STEM_DISEASES.map((disease) => (
                <View key={disease.id} style={styles.diseaseCard}>
                  <Image
                    source={{ uri: disease.image }}
                    style={styles.diseaseImage}
                  />
                  <LinearGradient
                    colors={['transparent', COLORS.darkGreen]}
                    style={styles.diseaseGradient}
                  />
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Tech Stack Section */}
        <View style={styles.techSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Technology Stack</Text>
          </View>
          
          <View style={styles.techStack}>
            {TECH_STACK.map((item, index) => (
              <View key={index} style={styles.techCard}>
                <View style={styles.techIconContainer}>
                  <FontAwesome5 name={item.icon} size={24} color={COLORS.accentGreen} />
                </View>
                <View style={styles.techContent}>
                  <Text style={styles.techCategory}>{item.category}</Text>
                  <Text style={styles.techName}>{item.tech}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 TomatoGuard. All rights reserved.</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Scroll to Top Button */}
      <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
        <FontAwesome5 name="arrow-up" size={16} color={COLORS.textLight} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCream,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Hero Section
  heroSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 80 : 100,
    borderRadius: isSmallDevice ? 40 : 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: isSmallDevice ? 12 : 14,
    color: COLORS.limeglow,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: isSmallDevice ? scale(20) : isTablet ? 26 : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 28 : 38,
    maxWidth: 900,
  },
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.limeglow,
    marginVertical: 20,
  },
  heroSubtext: {
    fontSize: isSmallDevice ? 12 : 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  sectionHeaderLight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  sectionAccent: {
    width: 4,
    height: 28,
    backgroundColor: COLORS.accentGreen,
    borderRadius: 2,
  },
  sectionAccentLight: {
    width: 4,
    height: 28,
    backgroundColor: COLORS.limeglow,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? scale(22) : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textDark,
  },
  sectionTitleLight: {
    fontSize: isSmallDevice ? scale(22) : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
  },
  // Introduction Section
  introSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 30 : 40,
  },
  introCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    padding: isSmallDevice ? 20 : 24,
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  introText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 20 : 24,
    color: COLORS.textMuted,
    marginBottom: 16,
    textAlign: 'justify',
  },
  // Team Section
  teamSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 30 : 40,
    backgroundColor: COLORS.bgLight,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isSmallDevice ? 16 : 20,
  },
  teamCard: {
    width: isSmallDevice ? (SCREEN_WIDTH - 56) / 2 : isTablet ? 200 : 220,
    height: isSmallDevice ? 200 : isTablet ? 220 : 260,
    borderRadius: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.darkGreen,
    elevation: 3,
  },
  teamImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  teamGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  teamInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  teamName: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  teamRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  teamRoleText: {
    fontSize: 9,
    color: COLORS.limeglow,
    fontWeight: '600',
  },
  // Diseases Section
  diseasesSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 30 : 40,
  },
  diseaseCategory: {
    marginBottom: isSmallDevice ? 30 : 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorRed,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  diseaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 10 : 12,
  },
  diseaseCard: {
    width: isSmallDevice ? (SCREEN_WIDTH - 50) / 2 : isTablet ? 150 : 160,
    height: isSmallDevice ? 130 : isTablet ? 140 : 160,
    borderRadius: isSmallDevice ? 10 : 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.darkGreen,
  },
  diseaseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  diseaseGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  diseaseName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  // Tech Stack Section
  techSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 30 : 40,
    backgroundColor: COLORS.bgCream,
  },
  techStack: {
    gap: isSmallDevice ? 12 : 16,
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e0ddd6',
    gap: 16,
  },
  techIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techContent: {
    flex: 1,
  },
  techCategory: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  techName: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  // Footer
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 1,
    borderTopColor: '#e0ddd6',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  // Scroll to Top Button
  scrollTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default AboutPageScreen;