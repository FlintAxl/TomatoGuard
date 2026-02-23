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
import { FontAwesome5 } from '@expo/vector-icons';
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

const BlogFour: React.FC = () => {
  const navigation = useNavigation();

  const handleBackToBlogs = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771769619/eb324c9c-6ee2-4820-88d3-a1b61f264340.png' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(8, 22, 0, 0.95)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToBlogs}>
              <FontAwesome5 name="arrow-left" size={16} color={COLORS.textLight} />
              <Text style={styles.backButtonText}>Back to Blogs</Text>
            </TouchableOpacity>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Culinary History</Text>
            </View>
            <Text style={styles.heroTitle}>
              The History of Tomato in the Kitchen
            </Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <FontAwesome5 name="calendar-alt" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>February 1, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <FontAwesome5 name="clock" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>9 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Article Content ───────────────────────────────────────────────── */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>

            {/* Introduction */}
            <Text style={styles.paragraph}>
              Few ingredients have transformed global cuisine as profoundly as the tomato. From its humble origins in the Americas to its indispensable place in kitchens worldwide, the tomato's culinary journey is a story of discovery, skepticism, and ultimate triumph. Today it forms the backbone of countless sauces, condiments, and dishes that define entire food cultures.
            </Text>

            {/* Section 1 */}
            <Text style={styles.sectionTitle}>Origins: From Wild Fruit to Kitchen Staple</Text>

            <Text style={styles.paragraph}>
              The tomato (Solanum lycopersicum) was first domesticated by indigenous peoples of western South America, with evidence of cultivation dating back to 500 BC in present-day Mexico and Peru. The Aztecs called it "tomatl" and incorporated it into their cooking long before European contact.
            </Text>

            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>The European Introduction</Text>
              <Text style={styles.paragraph}>
                Spanish conquistadors brought the tomato to Europe in the early 16th century following their conquest of Mexico. However, European reception was deeply skeptical — the tomato belongs to the nightshade family, and many believed it to be poisonous. For nearly two centuries, it was grown primarily as an ornamental curiosity.
              </Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Key Historical Milestones:</Text>
                <Text style={styles.bulletPoint}>• 1519 — Hernán Cortés encounters tomatoes in Aztec markets</Text>
                <Text style={styles.bulletPoint}>• 1544 — Pietro Mattioli, Italian botanist, first classifies the tomato in Europe</Text>
                <Text style={styles.bulletPoint}>• 1692 — First known European tomato recipe published in Naples, Italy</Text>
                <Text style={styles.bulletPoint}>• 1800s — Tomato acceptance spreads across Europe and North America</Text>
              </View>
            </View>

            {/* Section 2 */}
            <Text style={styles.sectionTitle}>The Discovery of Tomato Sauce</Text>

            <Text style={styles.paragraph}>
              Italy was the first European nation to fully embrace the tomato as a culinary ingredient. By the late 17th century, Neapolitan cooks began experimenting with tomatoes as a base for sauces, forever changing Italian — and eventually global — cuisine.
            </Text>

            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.treatmentCard}
            >
              <FontAwesome5 name="mortar-pestle" size={32} color={COLORS.color1} />
              <Text style={styles.treatmentTitle}>The Birth of Salsa di Pomodoro</Text>
              <Text style={styles.treatmentText}>
                The 1692 cookbook "Lo Scalco alla Moderna" by Antonio Latini contained the first recorded European tomato sauce recipe — a simple preparation of roasted tomatoes, chiles, onion, and thyme that bears remarkable resemblance to modern tomato salsa.
              </Text>
            </LinearGradient>

            <Text style={styles.paragraph}>
              By the 18th century, tomato sauce had become inseparable from Neapolitan pasta dishes. The combination of tomato, olive oil, garlic, and basil — now known universally as marinara sauce — emerged during this period and remains one of the most replicated recipes in world history.
            </Text>

            {/* Section 3 */}
            <Text style={styles.sectionTitle}>The Invention of Tomato Ketchup</Text>

            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>From Fermented Fish to the Bottle</Text>
              <Text style={styles.paragraph}>
                Surprisingly, ketchup did not begin as a tomato product. The word derives from the Chinese "kê-tsiap," a fermented fish sauce that British traders encountered in Southeast Asia during the 17th century. Early English ketchup recipes used mushrooms, anchovies, or walnuts.
              </Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Ketchup Timeline:</Text>
                <Text style={styles.bulletPoint}>• 1690s — "Catchup" enters English vocabulary from Southeast Asian trade routes</Text>
                <Text style={styles.bulletPoint}>• 1812 — First American tomato ketchup recipe by James Mease of Philadelphia</Text>
                <Text style={styles.bulletPoint}>• 1876 — Henry J. Heinz bottles and sells tomato ketchup commercially</Text>
                <Text style={styles.bulletPoint}>• 1890s — Heinz's ketchup becomes the dominant condiment in American households</Text>
              </View>
            </View>

            <Text style={styles.paragraph}>
              Henry Heinz's version distinguished itself through the addition of vinegar and sugar as natural preservatives, solving the spoilage problem that had plagued earlier homemade ketchups. His standardized recipe and distinctive bottle shape remain virtually unchanged today.
            </Text>

            {/* Section 4 — Grid */}
            <Text style={styles.sectionTitle}>Essential Tomato Kitchen Products</Text>

            <View style={styles.preventionGrid}>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="pizza-slice" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Pizza Sauce</Text>
                <Text style={styles.preventionCardText}>
                  Developed in 19th-century Naples alongside the modern pizza, tomato-based pizza sauce became globally iconic after Italian immigrants brought pizza to New York in the early 1900s.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <FontAwesome5 name="jar" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Canned Tomatoes</Text>
                <Text style={styles.preventionCardText}>
                  Commercial canning of tomatoes began in the 1840s in the United States. By the early 1900s, canned tomatoes had democratized Italian-style cooking across households that couldn't access fresh produce year-round.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <FontAwesome5 name="seedling" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Tomato Paste</Text>
                <Text style={styles.preventionCardText}>
                  Concentrated tomato paste, made by cooking tomatoes for hours to remove most of their water content, originated in Sicily as "estratto" — a sun-dried paste used to intensify flavor in slow-cooked stews.
                </Text>
              </View>

              <View style={styles.preventionCard}>
                <FontAwesome5 name="flask" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Tomato Juice</Text>
                <Text style={styles.preventionCardText}>
                  First served commercially in 1917 at the French Lick Springs Hotel in Indiana, tomato juice gained mass popularity during Prohibition as a sophisticated non-alcoholic beverage and later as the base of the Bloody Mary cocktail.
                </Text>
              </View>
            </View>

            {/* Section 5 */}
            <Text style={styles.sectionTitle}>Tomatoes and the Globalization of Cuisine</Text>

            <Text style={styles.paragraph}>
              The 19th and 20th centuries saw tomato-based products spread across every continent, fundamentally altering local food cultures. Spanish colonization introduced tomato cooking to the Philippines and parts of Africa. Indian cuisine adopted the tomato into its rich spice-based cooking by the 19th century, creating iconic dishes like butter chicken and tikka masala that rely on tomato as a foundational ingredient.
            </Text>

            <View style={styles.resistanceBox}>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>Italy</Text> — Pasta al pomodoro, arrabbiata, amatriciana</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>Spain</Text> — Gazpacho, sofrito, pan con tomate</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>Mexico</Text> — Salsa roja, enchilada sauce, pozole</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>India</Text> — Makhani gravy, tamatar chutney, rasam</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>USA</Text> — Ketchup, marinara, chili, tomato soup</Text>
            </View>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <FontAwesome5 name="utensils" size={44} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>A Fruit That Shaped World Cuisine</Text>
              <Text style={styles.conclusionText}>
                From an ornamental curiosity dismissed as poisonous to the most commercially significant fruit in the world, the tomato's journey through culinary history is unparalleled. It has unified food cultures across continents, inspired some of the world's most beloved dishes, and continues to evolve in kitchens from Tokyo to Buenos Aires.
              </Text>
            </LinearGradient>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Curious about how tomatoes grow? Explore our other articles on tomato cultivation and health!
              </Text>
              <TouchableOpacity style={styles.backButton} onPress={handleBackToBlogs}>
                <FontAwesome5 name="arrow-left" size={15} color={COLORS.textLight} />
                <Text style={styles.ctaButtonText}>Back to Articles</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.color4 },
  scrollView: { flex: 1 },
  heroContainer: {
    width: '100%',
    height: isSmallDevice ? 300 : 400,
    position: 'relative',
  },
  heroImage: { 
    width: '100%', 
    height: '100%' 
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
    bottom: 0, left: 0, right: 0,
    padding: isSmallDevice ? 20 : 32,
    maxWidth: 800, alignSelf: 'center', width: '100%',
  },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16, alignSelf: 'flex-start',
  },
  backButtonText: { color: COLORS.textLight, fontSize: 14, fontWeight: '500' },
  categoryBadge: {
    backgroundColor: COLORS.color2, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16,
  },
  categoryText: {
    color: COLORS.textLight, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: isSmallDevice ? 28 : 38, fontWeight: '700', fontStyle: 'italic',
    color: COLORS.textLight, marginBottom: 16,
    lineHeight: isSmallDevice ? 36 : 48,
  },
  metaContainer: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: COLORS.muted },
  contentContainer: {
    paddingHorizontal: isSmallDevice ? 20 : 32,
    paddingVertical: isSmallDevice ? 24 : 40,
    maxWidth: 800, alignSelf: 'center', width: '100%',
  },
  articleContent: { gap: 24 },
  sectionTitle: {
    fontSize: isSmallDevice ? 24 : 28, fontWeight: '700', fontStyle: 'italic',
    color: COLORS.textLight, marginTop: 16, marginBottom: 8,
  },
  paragraph: {
    fontSize: isSmallDevice ? 15 : 16, lineHeight: isSmallDevice ? 24 : 26,
    color: COLORS.muted,
  },
  diseaseCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: isSmallDevice ? 12 : 16,
    padding: isSmallDevice ? 16 : 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', marginVertical: 12,
  },
  diseaseTitle: {
    fontSize: isSmallDevice ? 18 : 20, fontWeight: '700',
    color: COLORS.color2, marginBottom: 12,
  },
  symptomBox: {
    backgroundColor: 'rgba(45,119,54,0.2)', borderRadius: 8,
    padding: 16, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: COLORS.color3,
  },
  symptomTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginBottom: 8,
  },
  bulletPoint: { fontSize: 14, color: COLORS.muted, marginBottom: 4 },
  treatmentCard: {
    padding: isSmallDevice ? 20 : 24, borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center', marginVertical: 16,
  },
  treatmentTitle: {
    fontSize: isSmallDevice ? 20 : 22, fontWeight: '700', color: COLORS.textLight,
    marginTop: 12, marginBottom: 8, textAlign: 'center',
  },
  treatmentText: {
    fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22,
  },
  preventionGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginVertical: 16,
  },
  preventionCard: {
    backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: 16,
    flex: 1, minWidth: isSmallDevice ? '100%' : 220,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  preventionCardTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.textLight,
    marginTop: 12, marginBottom: 8,
  },
  preventionCardText: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },
  resistanceBox: {
    backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 12,
  },
  resistanceItem: { fontSize: 14, color: COLORS.muted },
  bold: { fontWeight: '700', color: COLORS.color2, fontSize: 16 },
  conclusionCard: {
    padding: isSmallDevice ? 24 : 32, borderRadius: isSmallDevice ? 12 : 16,
    alignItems: 'center', marginTop: 24,
  },
  conclusionTitle: {
    fontSize: isSmallDevice ? 22 : 26, fontWeight: '700', fontStyle: 'italic',
    color: COLORS.textLight, marginTop: 16, marginBottom: 12, textAlign: 'center',
  },
  conclusionText: {
    fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22,
  },
  ctaContainer: { alignItems: 'center', marginTop: 24, gap: 16 },
  ctaText: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  ctaButtonText: { color: COLORS.textLight, fontSize: 14, fontWeight: '600' },
});

export default BlogFour;