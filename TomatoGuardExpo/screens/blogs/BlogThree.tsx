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

interface BlogThreeProps {
  setActiveTab: (tab: string) => void;
}

const BlogThree: React.FC<BlogThreeProps> = ({ setActiveTab }) => {
  const handleBackToBlogs = () => {
    setActiveTab('blogs');
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
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1769081501/typeventure/profile%20pictures/rgefoc4y0iu5uxq91oic.jpg' }}
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
              <Text style={styles.categoryText}>Health & Wellness</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Health Benefits of Tomatoes: What You Need to Know
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>January 25, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>7 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>
            {/* Introduction */}
            <Text style={styles.paragraph}>
              Tomatoes have earned their place as a staple in kitchens around the world, but their value extends far beyond their culinary versatility. These vibrant red fruits are packed with nutrients and compounds that offer remarkable health benefits, from supporting heart health to potentially reducing cancer risk. Let's explore what makes tomatoes such a powerful addition to a healthy diet.
            </Text>

            {/* Heart Health Section */}
            <Text style={styles.sectionTitle}>1. Promotes Heart Health</Text>
            
            <LinearGradient
              colors={['rgba(233, 82, 58, 0.15)', 'rgba(45, 119, 54, 0.15)']}
              style={styles.highlightCard}
            >
              <Ionicons name="heart" size={48} color={COLORS.color2} />
              <Text style={styles.highlightText}>
                Heart disease is the leading cause of death worldwide. Regular tomato consumption may help reduce your risk significantly.
              </Text>
            </LinearGradient>

            <Text style={styles.paragraph}>
              Studies have shown that low blood levels of lycopene and beta-carotene are linked to increased risk of heart attacks and strokes. Clinical trials indicate that supplementing with lycopene may help reduce LDL (bad) cholesterol levels.
            </Text>

            <Text style={styles.paragraph}>
              Additionally, the high levels of potassium in tomatoes help regulate blood pressure by counteracting the effects of sodium and reducing tension in blood vessel walls. One study found that people who consumed lycopene-rich foods had up to a 26% reduced risk of heart disease.
            </Text>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>26%</Text>
              <Text style={styles.statLabel}>Reduced Risk of Heart Disease</Text>
              <Text style={styles.statSubtext}>with regular lycopene consumption</Text>
            </View>

            {/* Cancer Prevention Section */}
            <Text style={styles.sectionTitle}>2. May Help Prevent Cancer</Text>
            
            <Text style={styles.paragraph}>
              Cancer occurs when abnormal cells grow uncontrollably and spread to other parts of the body. Observational studies have noted links between tomatoes and reduced incidence of prostate, lung, and stomach cancers.
            </Text>

            <View style={styles.researchCard}>
              <Ionicons name="flask-outline" size={32} color={COLORS.color1} />
              <Text style={styles.researchTitle}>Research Findings</Text>
              <Text style={styles.researchText}>
                The high lycopene content in tomatoes is thought to be responsible for these protective effects. Studies show that high intake of carotenoids, including lycopene, may protect against lung and prostate cancer in particular.
              </Text>
            </View>

            <Text style={styles.paragraph}>
              While raw tomatoes are healthy, cooked tomato products like tomato sauce contain even higher concentrations of bioavailable lycopene, making them particularly beneficial for cancer prevention.
            </Text>

            {/* Skin Health Section */}
            <Text style={styles.sectionTitle}>3. Protects Against Sun Damage</Text>
            
            <View style={styles.skinCard}>
              <View style={styles.skinHeader}>
                <Ionicons name="sunny" size={40} color={COLORS.color1} />
                <Text style={styles.skinTitle}>Natural Sun Protection</Text>
              </View>
              <Text style={styles.paragraph}>
                Tomatoes may offer some protection against sunburn. In one study, people who consumed 40 grams of tomato paste (providing 16 mg of lycopene) with olive oil daily for 10 weeks experienced 40% fewer sunburns.
              </Text>
            </View>

            <Text style={styles.paragraph}>
              The antioxidants in tomatoes, particularly lycopene, help protect skin cells from UV damage and may reduce the risk of premature aging. However, tomatoes should complement—not replace—proper sun protection measures like sunscreen.
            </Text>

            {/* Bone Health Section */}
            <Text style={styles.sectionTitle}>4. Supports Strong Bones</Text>
            
            <View style={styles.boneGrid}>
              <View style={styles.boneCard}>
                <Ionicons name="fitness-outline" size={28} color={COLORS.color2} />
                <Text style={styles.boneCardTitle}>Vitamin K</Text>
                <Text style={styles.boneCardText}>
                  Essential for bone metabolism and calcium regulation, helping maintain bone density and strength.
                </Text>
              </View>

              <View style={styles.boneCard}>
                <Ionicons name="leaf-outline" size={28} color={COLORS.color2} />
                <Text style={styles.boneCardTitle}>Lycopene</Text>
                <Text style={styles.boneCardText}>
                  Studies suggest lycopene may help reduce oxidative stress in bones, potentially lowering fracture risk.
                </Text>
              </View>
            </View>

            <Text style={styles.paragraph}>
              Research indicates that lycopene supplementation may reduce oxidative stress markers and increase bone density, particularly beneficial for postmenopausal women who are at higher risk of osteoporosis.
            </Text>

            {/* Eye Health Section */}
            <Text style={styles.sectionTitle}>5. Improves Vision</Text>
            
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.visionCard}
            >
              <Ionicons name="eye-outline" size={48} color={COLORS.color1} />
              <Text style={styles.visionTitle}>Protect Your Eyes</Text>
              <Text style={styles.visionText}>
                Tomatoes contain lutein, zeaxanthin, and beta-carotene—powerful antioxidants that protect your eyes from light-induced damage and may reduce the risk of age-related macular degeneration and cataracts.
              </Text>
            </LinearGradient>

            {/* Digestive Health Section */}
            <Text style={styles.sectionTitle}>6. Aids Digestive Health</Text>
            
            <Text style={styles.paragraph}>
              The fluid and fiber content in tomatoes may be helpful for people prone to constipation. Eating foods high in water content and fiber can help hydrate and support normal bowel movements.
            </Text>

            <View style={styles.fiberBox}>
              <View style={styles.fiberItem}>
                <Text style={styles.fiberValue}>1.5g</Text>
                <Text style={styles.fiberLabel}>Fiber per medium tomato</Text>
              </View>
              <View style={styles.fiberDivider} />
              <View style={styles.fiberItem}>
                <Text style={styles.fiberValue}>95%</Text>
                <Text style={styles.fiberLabel}>Water content</Text>
              </View>
            </View>

            {/* Diabetes Management Section */}
            <Text style={styles.sectionTitle}>7. Helps Manage Blood Sugar</Text>
            
            <Text style={styles.paragraph}>
              Tomatoes are an excellent food choice for people with diabetes. They have a low glycemic index, meaning they don't cause rapid spikes in blood sugar levels. The fiber in tomatoes also helps slow down the absorption of sugar in the bloodstream.
            </Text>

            <View style={styles.diabetesCard}>
              <Ionicons name="water-outline" size={32} color={COLORS.color2} />
              <Text style={styles.diabetesTitle}>Low Glycemic Index</Text>
              <Text style={styles.diabetesText}>
                Studies show that people with type 2 diabetes who consume high-fiber diets have lower blood glucose levels and improved insulin sensitivity.
              </Text>
            </View>

            {/* Brain Health Section */}
            <Text style={styles.sectionTitle}>8. Supports Brain Health</Text>
            
            <Text style={styles.paragraph}>
              The antioxidants in tomatoes, especially lycopene, may help prevent cell damage that contributes to Alzheimer's disease and dementia. The folate in tomatoes also plays a crucial role in maintaining brain function and may help prevent cognitive decline.
            </Text>

            <View style={styles.brainBenefits}>
              <View style={styles.brainItem}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.color1} />
                <Text style={styles.brainText}>Protects brain cells from oxidative damage</Text>
              </View>
              <View style={styles.brainItem}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.color1} />
                <Text style={styles.brainText}>May reduce risk of neurodegenerative diseases</Text>
              </View>
              <View style={styles.brainItem}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.color1} />
                <Text style={styles.brainText}>Supports cognitive function and memory</Text>
              </View>
            </View>

            {/* How to Maximize Benefits */}
            <Text style={styles.sectionTitle}>Maximizing Health Benefits</Text>
            
            <View style={styles.tipsGrid}>
              <View style={styles.tipCard}>
                <Ionicons name="flame-outline" size={32} color={COLORS.color2} />
                <Text style={styles.tipCardTitle}>Cook Your Tomatoes</Text>
                <Text style={styles.tipCardText}>
                  Heat increases lycopene bioavailability. Tomato sauce, paste, and cooked tomatoes provide more absorbable lycopene than raw tomatoes.
                </Text>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="nutrition-outline" size={32} color={COLORS.color2} />
                <Text style={styles.tipCardTitle}>Add Healthy Fats</Text>
                <Text style={styles.tipCardText}>
                  Lycopene is fat-soluble. Pair tomatoes with olive oil, avocado, or nuts to enhance absorption of beneficial compounds.
                </Text>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="color-palette-outline" size={32} color={COLORS.color2} />
                <Text style={styles.tipCardTitle}>Choose Ripe Tomatoes</Text>
                <Text style={styles.tipCardText}>
                  Fully ripe, deeply colored tomatoes contain the highest levels of lycopene and other beneficial antioxidants.
                </Text>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="restaurant-outline" size={32} color={COLORS.color2} />
                <Text style={styles.tipCardTitle}>Eat Regularly</Text>
                <Text style={styles.tipCardText}>
                  Consistent consumption provides steady benefits. Aim to include tomatoes in your diet several times per week.
                </Text>
              </View>
            </View>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <Ionicons name="ribbon" size={48} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>The Takeaway</Text>
              <Text style={styles.conclusionText}>
                Tomatoes are more than just a delicious ingredient—they're a nutritional powerhouse with scientifically-backed health benefits. From protecting your heart and bones to supporting skin and eye health, these versatile fruits deserve a prominent place in your diet. Whether you enjoy them raw in salads, cooked in sauces, or dried as a snack, you're nourishing your body with every bite.
              </Text>
            </LinearGradient>

            {/* Call to Action */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Growing your own tomatoes? Share your experiences and tips with our community!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => setActiveTab('forum')}
              >
                <Text style={styles.ctaButtonText}>Join the Discussion</Text>
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
  highlightCard: {
    padding: isSmallDevice ? 20 : 24,
    borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(233, 82, 58, 0.3)',
  },
  highlightText: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  statBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.color2,
    marginBottom: 8,
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'System',
  },
  statSubtext: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    fontFamily: 'System',
  },
  researchCard: {
    backgroundColor: 'rgba(45, 119, 54, 0.2)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.color3,
    marginVertical: 16,
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'System',
  },
  researchText: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 22,
    fontFamily: 'System',
  },
  skinCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  skinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  skinTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    color: COLORS.textLight,
    flex: 1,
    fontFamily: 'System',
  },
  boneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 16,
  },
  boneCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: isSmallDevice ? '100%' : 240,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  boneCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'System',
  },
  boneCardText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    fontFamily: 'System',
  },
  visionCard: {
    padding: isSmallDevice ? 24 : 32,
    borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  visionTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'System',
  },
  visionText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
  fiberBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  fiberItem: {
    alignItems: 'center',
    flex: 1,
  },
  fiberValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.color2,
    marginBottom: 8,
    fontFamily: 'System',
  },
  fiberLabel: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    fontFamily: 'System',
  },
  fiberDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  diabetesCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  diabetesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  diabetesText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
  brainBenefits: {
    backgroundColor: 'rgba(45, 119, 54, 0.2)',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    marginVertical: 16,
  },
  brainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brainText: {
    fontSize: 14,
    color: COLORS.muted,
    flex: 1,
    fontFamily: 'System',
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 16,
  },
  tipCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minWidth: isSmallDevice ? '100%' : 220,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  tipCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  tipCardText: {
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

export default BlogThree;