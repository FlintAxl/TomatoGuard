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
import { useNavigation } from '@react-navigation/native';
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

interface BlogTwoProps {
  setActiveTab: (tab: string) => void;
}

const BlogTwo: React.FC = () => {
  const navigation = useNavigation();

  const handleBackToBlogs = () => {
  navigation.goBack(); 
};
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_xe9pbpxe9pbpxe9p_yaemwf.png' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(8, 22, 0, 0.95)']}
            style={styles.heroGradient}
          />
          
          <View style={styles.heroContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToBlogs}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textLight} />
              <Text style={styles.backButtonText}>Back to Blogs</Text>
            </TouchableOpacity>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Nutrition</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Tomatoes: Nutrition Facts and Health Benefits
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>January 20, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>6 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>
            {/* Introduction */}
            <Text style={styles.paragraph}>
              Tomatoes are one of the most popular vegetables (technically fruits) worldwide, and for good reason. They're not just delicious and versatile in the kitchen—they're also packed with nutrients that offer numerous health benefits. From vitamins and minerals to powerful antioxidants, tomatoes deserve their reputation as a superfood.
            </Text>
        <Image
          source={{ uri: 'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771331943/ae613dd4-c746-4502-b757-58b9bf0a81f1.png' }}
          style={{ width: '100%', height: 300, borderRadius: 10, marginTop: 10, marginBottom: 10 }}
          resizeMode="cover"
            />

            {/* Nutrition Facts Section */}
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.nutritionCard}
            >
              <Text style={styles.nutritionCardTitle}>Per Medium Tomato (123g)</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>22</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>5g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>1.1g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>1.5g</Text>
                  <Text style={styles.nutritionLabel}>Fiber</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.paragraph}>
              Tomatoes are incredibly low in calories while being rich in essential nutrients. They consist of approximately 95% water, making them extremely hydrating while providing valuable vitamins and minerals.
            </Text>

            {/* Vitamins and Minerals */}
            <Text style={styles.sectionTitle}>Rich in Vitamins and Minerals</Text>
            <Image
          source={{ uri: 'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771332228/b11743ac-793e-4bfb-ba49-33fa553218fe.png' }}
          style={{ width: '100%', height: 300, borderRadius: 10, marginTop: 10, marginBottom: 10 }}
          resizeMode="cover"
            />
            <View style={styles.vitaminCard}>
              <View style={styles.vitaminHeader}>
                <Ionicons name="nutrition-outline" size={24} color={COLORS.color2} />
                <Text style={styles.vitaminTitle}>Vitamin C</Text>
              </View>
              <Text style={styles.paragraph}>
                Tomatoes are an excellent source of vitamin C, with one medium tomato providing about 28% of your daily needs. This essential nutrient acts as a powerful antioxidant and supports immune function, skin health, and iron absorption.
              </Text>
            </View>

            <View style={styles.vitaminCard}>
              <View style={styles.vitaminHeader}>
                <Ionicons name="flower-outline" size={24} color={COLORS.color2} />
                <Text style={styles.vitaminTitle}>Potassium</Text>
              </View>
              <Text style={styles.paragraph}>
                Rich in potassium, tomatoes help regulate blood pressure and support heart health. Potassium is crucial for muscle function and maintaining proper fluid balance in the body.
              </Text>
            </View>

            <View style={styles.vitaminCard}>
              <View style={styles.vitaminHeader}>
                <Ionicons name="fitness-outline" size={24} color={COLORS.color2} />
                <Text style={styles.vitaminTitle}>Vitamin K1</Text>
              </View>
              <Text style={styles.paragraph}>
                Also known as phylloquinone, vitamin K1 is essential for blood clotting and bone health. Tomatoes provide a good amount of this important nutrient.
              </Text>
            </View>

            <View style={styles.vitaminCard}>
              <View style={styles.vitaminHeader}>
                <Ionicons name="sunny-outline" size={24} color={COLORS.color2} />
                <Text style={styles.vitaminTitle}>Folate (Vitamin B9)</Text>
              </View>
              <Text style={styles.paragraph}>
                Folate is crucial for normal tissue growth and cell function. It's particularly important for pregnant women as it supports fetal development.
              </Text>
            </View>

            {/* Lycopene Section */}
            <Text style={styles.sectionTitle}>The Power of Lycopene</Text>
            
            <LinearGradient
              colors={['rgba(233, 82, 58, 0.2)', 'rgba(233, 82, 58, 0.05)']}
              style={styles.lycopeneCard}
            >
              <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.color2} />
              <Text style={styles.lycopeneTitle}>Lycopene: The Star Antioxidant</Text>
              <Text style={styles.lycopeneText}>
                Lycopene is the carotenoid that gives tomatoes their characteristic red color. It's one of the most powerful antioxidants found in food, linked to numerous health benefits including reduced risk of heart disease and certain cancers.
              </Text>
            </LinearGradient>

            <Text style={styles.paragraph}>
              Interestingly, cooking tomatoes actually increases the bioavailability of lycopene. This means your body can absorb and use more lycopene from cooked tomato products like sauce and paste compared to raw tomatoes.
            </Text>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={20} color={COLORS.color1} />
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipText}>
                Combine tomatoes with healthy fats like olive oil to maximize lycopene absorption. The fat helps your body absorb this fat-soluble antioxidant more effectively.
              </Text>
            </View>

            {/* Other Plant Compounds */}
            <Text style={styles.sectionTitle}>Additional Plant Compounds</Text>
            
            <View style={styles.compoundsList}>
              <View style={styles.compoundItem}>
                <View style={styles.compoundDot} />
                <View style={styles.compoundContent}>
                  <Text style={styles.compoundName}>Beta-Carotene</Text>
                  <Text style={styles.compoundDescription}>
                    Converts to vitamin A in your body, supporting eye health and immune function.
                  </Text>
                </View>
              </View>

              <View style={styles.compoundItem}>
                <View style={styles.compoundDot} />
                <View style={styles.compoundContent}>
                  <Text style={styles.compoundName}>Naringenin</Text>
                  <Text style={styles.compoundDescription}>
                    Found in tomato skin, this flavonoid has been shown to decrease inflammation and protect against various diseases.
                  </Text>
                </View>
              </View>

              <View style={styles.compoundItem}>
                <View style={styles.compoundDot} />
                <View style={styles.compoundContent}>
                  <Text style={styles.compoundName}>Chlorogenic Acid</Text>
                  <Text style={styles.compoundDescription}>
                    A powerful antioxidant compound that may help lower blood pressure in people with elevated levels.
                  </Text>
                </View>
              </View>
            </View>

            {/* Health Benefits Summary */}
            <Text style={styles.sectionTitle}>Key Health Benefits</Text>
            
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <Ionicons name="heart-outline" size={32} color={COLORS.color2} />
                <Text style={styles.benefitTitle}>Heart Health</Text>
                <Text style={styles.benefitText}>
                  The combination of lycopene, potassium, and vitamin C supports cardiovascular health and may help reduce cholesterol levels.
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <Ionicons name="eye-outline" size={32} color={COLORS.color2} />
                <Text style={styles.benefitTitle}>Eye Protection</Text>
                <Text style={styles.benefitText}>
                  Lutein and beta-carotene in tomatoes protect against age-related eye diseases and light-induced damage.
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <Ionicons name="shield-outline" size={32} color={COLORS.color2} />
                <Text style={styles.benefitTitle}>Cancer Prevention</Text>
                <Text style={styles.benefitText}>
                  High lycopene intake has been linked to reduced risk of certain cancers, particularly prostate and lung cancer.
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <Ionicons name="body-outline" size={32} color={COLORS.color2} />
                <Text style={styles.benefitTitle}>Skin Health</Text>
                <Text style={styles.benefitText}>
                  Antioxidants in tomatoes may protect skin from sun damage and promote healthy, youthful-looking skin.
                </Text>
              </View>
            </View>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <Ionicons name="nutrition" size={48} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>The Bottom Line</Text>
              <Text style={styles.conclusionText}>
                Tomatoes are a nutritional powerhouse that deserves a regular place in your diet. Whether eaten raw in salads, cooked in sauces, or enjoyed as juice, they provide an impressive array of nutrients and health-promoting compounds. Their versatility in the kitchen makes it easy to incorporate these nutritious fruits into your daily meals.
              </Text>
            </LinearGradient>

            {/* Call to Action */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Want to learn more about growing healthy, nutritious tomatoes? Join our community!
              </Text>
              <TouchableOpacity 
                style={styles.backButton} onPress={handleBackToBlogs}>
                <Text style={styles.ctaButtonText}>Visit Forums</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.color4,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: isSmallDevice ? 300 : 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: isSmallDevice ? 20 : 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: COLORS.color2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 28 : 38,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginBottom: 16,
    lineHeight: isSmallDevice ? 36 : 48,
    fontFamily: 'System',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
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
  contentContainer: {
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: isSmallDevice ? 24 : 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  articleContent: {
    gap: 24,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  paragraph: {
    fontSize: isSmallDevice ? 15 : 16,
    lineHeight: isSmallDevice ? 24 : 26,
    color: COLORS.muted,
    fontFamily: 'System',
  },
  nutritionCard: {
    padding: isSmallDevice ? 20 : 24,
    borderRadius: isSmallDevice ? 12 : 16,
    marginVertical: 16,
  },
  nutritionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.color1,
    marginBottom: 4,
    fontFamily: 'System',
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: 'System',
  },
  vitaminCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  vitaminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vitaminTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: COLORS.textLight,
    fontFamily: 'System',
  },
  lycopeneCard: {
    padding: isSmallDevice ? 24 : 32,
    borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: COLORS.color2,
  },
  lycopeneTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  lycopeneText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
  tipBox: {
    backgroundColor: 'rgba(45, 119, 54, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.color3,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.color1,
    marginBottom: 4,
    fontFamily: 'System',
  },
  tipText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    flex: 1,
    fontFamily: 'System',
  },
  compoundsList: {
    gap: 16,
    marginVertical: 16,
  },
  compoundItem: {
    flexDirection: 'row',
    gap: 16,
  },
  compoundDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.color2,
    marginTop: 6,
  },
  compoundContent: {
    flex: 1,
  },
  compoundName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
    fontFamily: 'System',
  },
  compoundDescription: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'System',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 16,
  },
  benefitCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: isSmallDevice ? '100%' : 220,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  conclusionCard: {
    padding: isSmallDevice ? 24 : 32,
    borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginTop: 24,
  },
  conclusionTitle: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  conclusionText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  ctaText: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    fontFamily: 'System',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.color2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default BlogTwo;