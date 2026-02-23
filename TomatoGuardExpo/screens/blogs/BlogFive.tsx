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

const BlogFive: React.FC = () => {
  const navigation = useNavigation();

  const handleBackToBlogs = () => {
    navigation.goBack();
  };

  const SPECIES = [
    {
      name: 'Cherry Tomato',
      scientific: 'Solanum lycopersicum var. cerasiforme',
      origin: 'South America (Peru & Ecuador)',
      found: 'Worldwide; especially popular in Mediterranean Europe and Southeast Asia',
      description: 'One of the oldest cultivated tomato varieties, cherry tomatoes are small, round, and intensely sweet. Their compact size and high sugar content make them ideal for salads, roasting, and snacking directly off the vine.',
    },
    {
      name: 'Beefsteak Tomato',
      scientific: 'Solanum lycopersicum (large-fruited cultivar group)',
      origin: 'United States (19th century breeding)',
      found: 'North America, Western Europe, Australia',
      description: 'The largest commercially grown tomato variety, beefsteaks are prized for their meaty flesh and low seed count. A single fruit can weigh over 450 grams, making it ideal for slicing into burgers and sandwiches.',
    },
    {
      name: 'Roma Tomato',
      scientific: 'Solanum lycopersicum (plum tomato group)',
      origin: 'Italy (developed in the 1950s)',
      found: 'Italy, USA, Latin America, Middle East',
      description: 'Also called plum tomatoes, Romas have a dense, dry flesh with few seeds — properties that make them the preferred choice for tomato paste, canned tomatoes, and pizza sauce production worldwide.',
    },
    {
      name: 'Heirloom Tomato',
      scientific: 'Solanum lycopersicum (various open-pollinated cultivars)',
      origin: 'Various — Europe, Americas (pre-1940s)',
      found: 'Specialty markets worldwide; artisan farming communities',
      description: 'Heirloom tomatoes encompass hundreds of open-pollinated varieties that have been preserved for generations. They exhibit extraordinary diversity in color (purple, yellow, striped, black), shape, and flavor, prized by chefs and home gardeners alike.',
    },
    {
      name: 'San Marzano Tomato',
      scientific: 'Solanum lycopersicum \'San Marzano\'',
      origin: 'San Marzano sul Sarno, Campania, Italy',
      found: 'Italy (protected origin), California, Argentina',
      description: 'San Marzano tomatoes hold DOP (Protected Designation of Origin) status in Italy, meaning authentic varieties can only be grown in the volcanic soil of the Sarno River valley near Mount Vesuvius. They are considered the finest tomatoes for Neapolitan pizza sauce.',
    },
    {
      name: 'Green Zebra Tomato',
      scientific: 'Solanum lycopersicum \'Green Zebra\'',
      origin: 'USA (developed by Tom Wagner in 1983)',
      found: 'USA, UK, France, Australia',
      description: 'A modern heirloom variety created through selective breeding, the Green Zebra is characterized by its distinctive green and yellow striped skin and tangy, citrus-like flavor. It remains green even when fully ripe, making it a popular choice in gourmet cuisine.',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771769877/39c35735-c63c-4432-9e2f-54d07f01436a.png' }}
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
              <Text style={styles.categoryText}>Botany & Species</Text>
            </View>
            <Text style={styles.heroTitle}>
              Different Species of Tomato: Origins, Science, and Where They Grow
            </Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <FontAwesome5 name="calendar-alt" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>February 8, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <FontAwesome5 name="clock" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>10 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Article Content ───────────────────────────────────────────────── */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>

            {/* Introduction */}
            <Text style={styles.paragraph}>
              With over 10,000 known varieties cultivated across every inhabited continent, the tomato is one of the most diverse fruit species on Earth. From the tiny wild ancestors of the Andes to the enormous beefsteaks of modern American agriculture, tomato diversity reflects thousands of years of human cultivation, selective breeding, and adaptation to wildly different climates and soils.
            </Text>

            {/* Taxonomy box */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.treatmentCard}
            >
              <FontAwesome5 name="dna" size={32} color={COLORS.color1} />
              <Text style={styles.treatmentTitle}>Botanical Classification</Text>
              <Text style={styles.treatmentText}>
                All cultivated tomatoes belong to the species Solanum lycopersicum within the family Solanaceae (nightshade family). The genus Solanum contains over 1,500 species, making the tomato a relative of potatoes, eggplants, peppers, and deadly nightshade.
              </Text>
            </LinearGradient>

            {/* Wild ancestors */}
            <Text style={styles.sectionTitle}>Wild Ancestor Species</Text>

            <Text style={styles.paragraph}>
              Before examining cultivated varieties, it is important to understand the wild species from which modern tomatoes descend. These wild relatives, still found in the Andes and Galápagos Islands, continue to serve as critical genetic resources for breeding disease-resistant and climate-adaptive cultivars.
            </Text>

            <View style={styles.diseaseCard}>
              <Text style={styles.diseaseTitle}>Key Wild Tomato Species</Text>
              <View style={styles.symptomBox}>
                <Text style={styles.symptomTitle}>Solanum pimpinellifolium — Currant Tomato</Text>
                <Text style={styles.bulletPoint}>• Smallest wild species; fruit no larger than a pea</Text>
                <Text style={styles.bulletPoint}>• Native to coastal Peru and Ecuador</Text>
                <Text style={styles.bulletPoint}>• Considered the direct wild ancestor of all cultivated tomatoes</Text>
                <Text style={styles.bulletPoint}>• Valued for disease resistance genes used in modern breeding</Text>
              </View>
              <View style={[styles.symptomBox, { marginTop: 12 }]}>
                <Text style={styles.symptomTitle}>Solanum galapagense — Galápagos Tomato</Text>
                <Text style={styles.bulletPoint}>• Grows exclusively in the Galápagos Islands</Text>
                <Text style={styles.bulletPoint}>• Highly salt-tolerant and adapted to volcanic soils</Text>
                <Text style={styles.bulletPoint}>• Subject of ongoing research for climate-resilient breeding</Text>
              </View>
              <View style={[styles.symptomBox, { marginTop: 12 }]}>
                <Text style={styles.symptomTitle}>Solanum peruvianum — Peruvian Tomato</Text>
                <Text style={styles.bulletPoint}>• Found from coastal Peru to northern Chile</Text>
                <Text style={styles.bulletPoint}>• Exceptional resistance to viruses and root-knot nematodes</Text>
                <Text style={styles.bulletPoint}>• Frequently used in disease-resistance breeding programs</Text>
              </View>
            </View>

            {/* Main cultivated species */}
            <Text style={styles.sectionTitle}>Major Cultivated Varieties</Text>

            <Text style={styles.paragraph}>
              The following varieties represent the most agriculturally and culinarily significant tomato cultivars grown worldwide. Each has been shaped by both natural selection and deliberate human breeding to excel in specific culinary roles or growing environments.
            </Text>

            {SPECIES.map((species, index) => (
              <View key={index} style={styles.diseaseCard}>
                <Text style={styles.diseaseTitle}>{species.name}</Text>
                <Text style={styles.paragraph}>{species.description}</Text>
                <View style={styles.symptomBox}>
                  <Text style={styles.bulletPoint}>
                    <Text style={styles.bold}>Scientific Name: </Text>{species.scientific}
                  </Text>
                  <Text style={styles.bulletPoint}>
                    <Text style={styles.bold}>Origin: </Text>{species.origin}
                  </Text>
                  <Text style={styles.bulletPoint}>
                    <Text style={styles.bold}>Commonly Found In: </Text>{species.found}
                  </Text>
                </View>
              </View>
            ))}

            {/* Section: growing regions */}
            <Text style={styles.sectionTitle}>Global Growing Regions</Text>

            <View style={styles.preventionGrid}>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="globe-americas" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Americas</Text>
                <Text style={styles.preventionCardText}>
                  California, Florida, and Mexico are among the world's largest tomato producers. The Central Valley of California alone produces over 12 million tons annually, primarily for processing.
                </Text>
              </View>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="globe-europe" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Europe</Text>
                <Text style={styles.preventionCardText}>
                  Italy and Spain lead European production. Italy's protected varieties (DOP/IGP) such as San Marzano and Pachino are recognized globally for exceptional quality.
                </Text>
              </View>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="globe-asia" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Asia</Text>
                <Text style={styles.preventionCardText}>
                  China is the world's largest tomato producer by volume. India, Turkey, and Egypt also produce massive quantities for both domestic consumption and export.
                </Text>
              </View>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="sun" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Africa & Middle East</Text>
                <Text style={styles.preventionCardText}>
                  Egypt, Morocco, and Nigeria are major African producers. Greenhouse tomato cultivation is rapidly expanding across the Middle East, including in Israel and Saudi Arabia.
                </Text>
              </View>
            </View>

            {/* Resistance codes */}
            <Text style={styles.sectionTitle}>Reading Variety Labels</Text>
            <Text style={styles.paragraph}>
              When purchasing tomato seeds or seedlings, breeders use standardized codes to indicate which diseases a variety has been bred to resist. Understanding these helps growers select the right tomato for their local conditions.
            </Text>
            <View style={styles.resistanceBox}>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>V</Text> — Verticillium Wilt resistance</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>F / FF / FFF</Text> — Fusarium Wilt (races 1, 2, 3)</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>N</Text> — Root-Knot Nematode resistance</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>T</Text> — Tobacco Mosaic Virus resistance</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>A</Text> — Alternaria stem canker resistance</Text>
              <Text style={styles.resistanceItem}><Text style={styles.bold}>TSWV</Text> — Tomato Spotted Wilt Virus resistance</Text>
            </View>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <FontAwesome5 name="leaf" size={44} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>A Species of Remarkable Diversity</Text>
              <Text style={styles.conclusionText}>
                The tomato's extraordinary range of sizes, colors, flavors, and adaptations reflects both millions of years of natural evolution and thousands of years of human cultivation. As climate change threatens agriculture globally, the genetic diversity preserved in wild tomato species and heirloom varieties represents an invaluable resource for feeding future generations.
              </Text>
            </LinearGradient>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Want to learn how to grow your own tomatoes from seed to harvest? Read our growing guide next!
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
    width: '100%', height: isSmallDevice ? 300 : 400, position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
  },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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
    fontSize: isSmallDevice ? 26 : 36, fontWeight: '700', fontStyle: 'italic',
    color: COLORS.textLight, marginBottom: 16, lineHeight: isSmallDevice ? 34 : 46,
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
    fontSize: isSmallDevice ? 15 : 16, lineHeight: isSmallDevice ? 24 : 26, color: COLORS.muted,
  },
  diseaseCard: {
    backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: isSmallDevice ? 12 : 16,
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
    fontSize: 14, fontWeight: '700', color: COLORS.textLight, marginBottom: 8,
  },
  bulletPoint: { fontSize: 14, color: COLORS.muted, marginBottom: 4, lineHeight: 20 },
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
  bold: { fontWeight: '700', color: COLORS.color2, fontSize: 15 },
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

export default BlogFive;