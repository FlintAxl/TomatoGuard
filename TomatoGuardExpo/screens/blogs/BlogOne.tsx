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

interface BlogOneProps {
  setActiveTab: (tab: string) => void;
}

const BlogOne: React.FC<BlogOneProps> = ({ setActiveTab }) => {
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
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1770819835/Gemini_Generated_Image_3xk5433xk5433xk5_qmc8ap.png' }}
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
              <Text style={styles.categoryText}>Disease Management</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              How to Identify, Treat, and Prevent Tomato Diseases
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>January 15, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.muted} />
                <Text style={styles.metaText}>8 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>
            {/* Introduction */}
            <Text style={styles.paragraph}>
              Tomato plants are susceptible to various diseases that can significantly impact their growth and fruit production. Understanding how to identify these diseases early, implement effective treatments, and take preventive measures is crucial for maintaining a healthy tomato garden.
            </Text>

            {/* Section: Common Tomato Diseases */}
            <Text style={styles.sectionTitle}>Common Tomato Diseases</Text>
            
            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>Early Blight</Text>
              <Text style={styles.paragraph}>
                Early blight is one of the most common tomato diseases, caused by the fungus Alternaria solani. It typically appears as dark, concentric spots on older leaves, which eventually turn yellow and drop off.
              </Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Symptoms to Watch For:</Text>
                <Text style={styles.bulletPoint}>• Dark brown spots with concentric rings</Text>
                <Text style={styles.bulletPoint}>• Yellowing leaves that drop prematurely</Text>
                <Text style={styles.bulletPoint}>• Spots may appear on stems and fruit</Text>
              </View>
            </View>

            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>Late Blight</Text>
              <Text style={styles.paragraph}>
                Late blight, caused by Phytophthora infestans, is a devastating disease that can destroy entire crops within days. It thrives in cool, wet conditions and spreads rapidly.
              </Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Symptoms to Watch For:</Text>
                <Text style={styles.bulletPoint}>• Water-soaked spots on leaves and stems</Text>
                <Text style={styles.bulletPoint}>• White fuzzy growth on leaf undersides</Text>
                <Text style={styles.bulletPoint}>• Brown, greasy-looking patches on fruit</Text>
              </View>
            </View>

            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>Septoria Leaf Spot</Text>
              <Text style={styles.paragraph}>
                Septoria leaf spot is caused by the fungus Septoria lycopersici and primarily affects the foliage of tomato plants. It's characterized by numerous small, circular spots with gray centers.
              </Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Symptoms to Watch For:</Text>
                <Text style={styles.bulletPoint}>• Small circular spots with dark borders</Text>
                <Text style={styles.bulletPoint}>• Gray or tan centers with tiny black specks</Text>
                <Text style={styles.bulletPoint}>• Starts on lower leaves and moves upward</Text>
              </View>
            </View>

            {/* Treatment Section */}
            <Text style={styles.sectionTitle}>Effective Treatment Strategies</Text>
            
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.treatmentCard}
            >
              <Ionicons name="medical-outline" size={32} color={COLORS.color1} />
              <Text style={styles.treatmentTitle}>Immediate Actions</Text>
              <Text style={styles.treatmentText}>
                Remove affected leaves immediately and dispose of them away from your garden. Do not compost diseased plant material as this can spread pathogens.
              </Text>
            </LinearGradient>

            <Text style={styles.paragraph}>
              For fungal diseases like early blight and septoria leaf spot, apply copper-based fungicides or organic alternatives such as neem oil. Always follow the product instructions and apply during cooler parts of the day to avoid leaf burn.
            </Text>

            <Text style={styles.paragraph}>
              Biological fungicides containing Bacillus subtilis can be effective for preventing and treating various fungal diseases while being environmentally friendly.
            </Text>

            {/* Prevention Section */}
            <Text style={styles.sectionTitle}>Prevention Best Practices</Text>
            
            <View style={styles.preventionGrid}>
              <View style={styles.preventionCard}>
                <Ionicons name="water-outline" size={28} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Proper Watering</Text>
                <Text style={styles.preventionCardText}>
                  Water at the base of plants early in the morning to allow foliage to dry quickly. Avoid overhead watering which promotes disease spread.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <Ionicons name="resize-outline" size={28} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Adequate Spacing</Text>
                <Text style={styles.preventionCardText}>
                  Space plants properly to ensure good air circulation. This helps foliage dry faster and reduces humidity around plants.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <Ionicons name="shuffle-outline" size={28} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Crop Rotation</Text>
                <Text style={styles.preventionCardText}>
                  Rotate tomatoes and related crops every 2-3 years to prevent soil-borne diseases from accumulating in one location.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <Ionicons name="leaf-outline" size={28} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Mulching</Text>
                <Text style={styles.preventionCardText}>
                  Apply organic mulch to prevent soil-borne pathogens from splashing onto lower leaves during rain or watering.
                </Text>
              </View>
            </View>

            {/* Resistant Varieties Section */}
            <Text style={styles.sectionTitle}>Choosing Resistant Varieties</Text>
            
            <Text style={styles.paragraph}>
              Selecting disease-resistant tomato varieties is one of the most effective prevention strategies. Look for varieties with resistance codes on seed packets:
            </Text>

            <View style={styles.resistanceBox}>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>V</Text> - Verticillium Wilt</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>F</Text> - Fusarium Wilt</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>N</Text> - Nematodes</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>T</Text> - Tobacco Mosaic Virus</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>A</Text> - Alternaria (Early Blight)</Text>
            </View>

            {/* Monitoring Section */}
            <Text style={styles.sectionTitle}>Regular Monitoring and Maintenance</Text>
            
            <Text style={styles.paragraph}>
              Inspect your tomato plants at least twice weekly, paying close attention to lower leaves where many diseases first appear. Early detection is key to preventing widespread infection.
            </Text>

            <Text style={styles.paragraph}>
              Remove suckers and lower branches to improve air circulation and reduce contact with soil. Stake or cage plants to keep fruit and foliage off the ground.
            </Text>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>Key Takeaways</Text>
              <Text style={styles.conclusionText}>
                Successfully managing tomato diseases requires a combination of prevention, early detection, and prompt treatment. By implementing proper cultural practices, choosing resistant varieties, and monitoring your plants regularly, you can minimize disease problems and enjoy a bountiful harvest.
              </Text>
            </LinearGradient>

            {/* Call to Action */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Have questions about tomato diseases? Join our community forum to discuss with experienced growers!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => setActiveTab('forum')}
              >
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
  diseaseCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  diseaseTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: COLORS.color2,
    marginBottom: 12,
    fontFamily: 'System',
  },
  symptomBox: {
    backgroundColor: 'rgba(45, 119, 54, 0.2)',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.color3,
  },
  symptomTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'System',
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 4,
    fontFamily: 'System',
  },
  treatmentCard: {
    padding: isSmallDevice ? 20 : 24,
    borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  treatmentTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
  treatmentText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'System',
  },
  preventionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 16,
  },
  preventionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: isSmallDevice ? '100%' : 220,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  preventionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'System',
  },
  preventionCardText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
    fontFamily: 'System',
  },
  resistanceBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  resistanceItem: {
    fontSize: 14,
    color: COLORS.muted,
    fontFamily: 'System',
  },
  bold: {
    fontWeight: '700',
    color: COLORS.color2,
    fontSize: 16,
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

export default BlogOne;