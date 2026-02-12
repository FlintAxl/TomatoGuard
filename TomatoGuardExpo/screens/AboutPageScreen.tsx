import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  { id: 15, name: 'Late Blight', image: 'hhttps://res.cloudinary.com/dxnb2ozgw/image/upload/v1770890160/lateblightleaf_m6ov1l.jpg' },
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
  { category: 'Frontend', tech: 'React Native Expo' },
  { category: 'Backend', tech: 'FastAPI' },
  { category: 'Machine Learning', tech: 'TensorFlow, MobileNet' },
];

const AboutPageScreen = () => {
  return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Research Title Section */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.titleSection}
            >
              <Text style={styles.researchLabel}>Research Title</Text>
              <Text style={styles.researchTitle}>
                TomatoGuard: An Online AI-Powered Disease Detection and Decision Support System for Tomato Growers in the Philippines
              </Text>
            </LinearGradient>

            {/* Introduction Section */}
            <View style={styles.introSection}>
              <Text style={styles.sectionTitle}>Introduction</Text>
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

            {/* Research Proprietors Section */}
            <View style={styles.teamSection}>
              <Text style={styles.sectionTitle}>Research Proprietors</Text>
              <View style={styles.teamGrid}>
                {TEAM_MEMBERS.map((member) => (
                  <View key={member.id} style={styles.teamCard}>
                    <Image
                      source={{ uri: member.image }}
                      style={styles.teamImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={styles.teamGradient}
                    />
                    <Text style={styles.teamName}>{member.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Supported Diseases Section */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color4]}
              style={styles.diseasesSection}
            >
              <Text style={styles.sectionTitleLight}>Supported Tomato Plant Parts & Diseases</Text>

              {/* Fruit Diseases */}
              <View style={styles.diseaseCategory}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>FRUIT</Text>
                </View>
                <View style={styles.diseaseGrid}>
                  {FRUIT_DISEASES.map((disease) => (
                    <View key={disease.id} style={styles.diseaseCard}>
                      <Image
                        source={{ uri: disease.image }}
                        style={styles.diseaseImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                  <Text style={styles.categoryTitle}>LEAF</Text>
                </View>
                <View style={styles.diseaseGrid}>
                  {LEAF_DISEASES.map((disease) => (
                    <View key={disease.id} style={styles.diseaseCard}>
                      <Image
                        source={{ uri: disease.image }}
                        style={styles.diseaseImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                  <Text style={styles.categoryTitle}>STEM</Text>
                </View>
                <View style={styles.diseaseGrid}>
                  {STEM_DISEASES.map((disease) => (
                    <View key={disease.id} style={styles.diseaseCard}>
                      <Image
                        source={{ uri: disease.image }}
                        style={styles.diseaseImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
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
              <Text style={styles.sectionTitle}>Technology Stack</Text>
              <View style={styles.techStack}>
                {TECH_STACK.map((item, index) => (
                  <View key={index} style={styles.techCard}>
                    <Text style={styles.techCategory}>{item.category}</Text>
                    <Text style={styles.techName}>{item.tech}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.color4,
  },
  // Title Section
  titleSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
    alignItems: 'center',
  },
  researchLabel: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 12 : 14,
    color: COLORS.color1,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
    fontWeight: '600',
  },
  researchTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(20) : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 28 : 38,
  },
  // Introduction Section
  introSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
    backgroundColor: COLORS.color4,
  },
  sectionTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(22) : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 24,
    textAlign: isSmallDevice ? 'center' : 'left',
  },
  sectionTitleLight: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? scale(22) : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 40,
    textAlign: 'center',
  },
  introText: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 22 : 24,
    color: COLORS.muted,
    marginBottom: 16,
    textAlign: 'justify',
  },
  // Team Section
  teamSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
    backgroundColor: COLORS.color4,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: isSmallDevice ? 'center' : 'flex-start',
    gap: isSmallDevice ? 16 : 20,
  },
  teamCard: {
    width: isSmallDevice ? (SCREEN_WIDTH - 56) / 2 : 220,
    height: isSmallDevice ? 200 : 260,
    borderRadius: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.color5,
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
    height: 100,
  },
  teamName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    fontFamily: 'System',
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  // Diseases Section
  diseasesSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
  },
  diseaseCategory: {
    marginBottom: isSmallDevice ? 30 : 40,
  },
  categoryHeader: {
    backgroundColor: COLORS.color2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryTitle: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  diseaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 12 : 16,
  },
  diseaseCard: {
    width: isSmallDevice ? (SCREEN_WIDTH - 56) / 2 : 160,
    height: isSmallDevice ? 140 : 180,
    borderRadius: isSmallDevice ? 10 : 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.color4,
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
    height: 80,
  },
  diseaseName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontFamily: 'System',
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  // Tech Stack Section
  techSection: {
    paddingHorizontal: isSmallDevice ? 20 : 40,
    paddingVertical: isSmallDevice ? 40 : 60,
    backgroundColor: COLORS.color4,
  },
  techStack: {
    gap: isSmallDevice ? 16 : 20,
  },
  techCard: {
    backgroundColor: COLORS.color5,
    padding: isSmallDevice ? 20 : 24,
    borderRadius: isSmallDevice ? 12 : 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.color2,
  },
  techCategory: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '700',
    color: COLORS.color1,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  techName: {
    fontFamily: 'System',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default AboutPageScreen;