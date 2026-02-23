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

const STAGES = [
  {
    number: '01',
    title: 'Seed Germination',
    timeline: 'Days 1 – 10',
    icon: 'seedling',
    description: 'The tomato\'s life begins inside the seed. When moisture, warmth, and oxygen reach the seed, the embryo activates and the radical (first root) emerges downward while the shoot pushes upward toward light.',
    needs: [
      'Soil temperature: 21–29°C (70–85°F) — critical for germination speed',
      'Consistent moisture — soil must be damp but never waterlogged',
      'No direct sunlight yet — seeds germinate in darkness or diffuse light',
      'Sterile seed-starting mix to prevent damping-off fungal disease',
      'Shallow planting depth: 6mm (¼ inch)',
    ],
    tip: 'Using a heat mat under seed trays is the single most effective way to speed germination. Seeds sown at 27°C typically sprout within 5–7 days versus 14+ days in cool conditions.',
  },
  {
    number: '02',
    title: 'Seedling Stage',
    timeline: 'Days 10 – 28',
    icon: 'leaf',
    description: 'The first structures to emerge are the cotyledons — seed leaves that are part of the embryo itself, not true leaves. After cotyledons, the plant produces its first set of true leaves with the characteristic serrated tomato shape.',
    needs: [
      'Bright light: 14–16 hours per day (grow lights or a sunny south-facing window)',
      'Reduce temperature slightly to 18–21°C to promote stocky, strong stems',
      'Begin light feeding with quarter-strength balanced fertilizer at week 2',
      'Thin to one seedling per cell if multiple germinated',
      'Gentle air circulation to strengthen stems and prevent disease',
    ],
    tip: 'Leggy (stretched) seedlings indicate insufficient light. If using a window, rotate the tray daily. If using grow lights, lower them to within 5cm of the seedlings.',
  },
  {
    number: '03',
    title: 'Transplanting & Establishment',
    timeline: 'Weeks 4 – 8',
    icon: 'hand-holding-seedling',
    description: 'Once seedlings have 2–3 sets of true leaves and outdoor temperatures are consistently above 10°C (50°F) at night, plants are ready for hardening off — the gradual process of acclimating them to outdoor conditions before transplanting.',
    needs: [
      'Harden off over 7–10 days by increasing outdoor exposure gradually',
      'Transplant deeply — bury up to ⅔ of the stem (roots form along buried stem)',
      'Full sun location: minimum 8 hours of direct sunlight daily',
      'Well-draining soil enriched with compost; pH 6.0–6.8',
      'Stake or cage at planting time to avoid root disturbance later',
      'Water deeply after transplanting; reduce frequency as roots establish',
    ],
    tip: 'Cloudy or overcast days are ideal for transplanting. Transplanting in direct midday sun stresses young plants. If unavoidable, shade with a light cloth for the first 2–3 days.',
  },
  {
    number: '04',
    title: 'Vegetative Growth',
    timeline: 'Weeks 6 – 10',
    icon: 'spa',
    description: 'During the vegetative stage the plant\'s energy is focused entirely on building structure — roots, stems, and foliage — before reproductive growth begins. Indeterminate varieties continue this growth throughout the season; determinate varieties have a more defined vegetative period.',
    needs: [
      'Nitrogen-rich fertilizer to support rapid leaf and stem growth',
      'Consistent watering — 2.5–3.8cm (1–1.5 inches) per week',
      'Pruning suckers on indeterminate varieties for airflow and energy focus',
      'Monitor for early signs of pests: aphids, whiteflies, flea beetles',
      'Side-dress with compost or slow-release fertilizer at week 8',
    ],
    tip: 'The main stem should be tied to its support every 20–30cm as it grows. Use soft ties or tomato clips — avoid wire or string that can cut into the stem.',
  },
  {
    number: '05',
    title: 'Flowering',
    timeline: 'Weeks 8 – 12',
    icon: 'sun',
    description: 'Tomato flowers are perfect (self-fertile) — each flower contains both male and female structures. Pollination occurs when vibration causes pollen to release from the anther onto the stigma. Bees are excellent pollinators; in greenhouses or indoors, manual vibration mimics this.',
    needs: [
      'Reduce nitrogen; increase phosphorus and potassium to support flowering',
      'Temperature must stay between 13–35°C for successful pollination',
      'Avoid temperatures above 32°C during the day — pollen becomes sterile',
      'Avoid heavy nitrogen feeding which encourages foliage over flowers',
      'Gently shake flower clusters or use an electric toothbrush for indoor pollination',
      'Maintain consistent soil moisture — drought stress drops flowers',
    ],
    tip: 'If flowers are falling off without setting fruit, the most common causes are temperature extremes, low humidity, or insufficient pollination. A simple fan running for a few hours daily can significantly improve pollination indoors.',
  },
  {
    number: '06',
    title: 'Fruit Set & Development',
    timeline: 'Weeks 10 – 18',
    icon: 'apple-alt',
    description: 'After successful pollination, the ovary swells into a fruit. Green tomatoes develop over several weeks as the fruit grows and cells multiply. This phase is the longest and most demanding on the plant in terms of water and nutrient resources.',
    needs: [
      'Increase potassium and calcium to prevent blossom end rot',
      'Consistent, even watering is critical — irregular moisture causes cracking',
      'Remove lower leaves as fruit develops to improve airflow',
      'Continue staking and tying stems as fruit weight increases',
      'Monitor for hornworms, fruit worms, and early blight on lower foliage',
      'Mulch heavily to maintain consistent soil moisture',
    ],
    tip: 'Blossom end rot — the dark, sunken patch on the bottom of developing fruit — is caused by calcium deficiency, which is itself usually caused by inconsistent watering rather than lack of calcium in the soil. Even, regular watering is the solution.',
  },
  {
    number: '07',
    title: 'Ripening & Harvest',
    timeline: 'Weeks 16 – 20+',
    icon: 'star',
    description: 'Ripening begins when the plant produces ethylene gas, triggering the breakdown of chlorophyll and the development of red (or yellow, orange, or purple, depending on variety) pigments. Full ripening continues even after picking, as long as the fruit is kept at room temperature.',
    needs: [
      'Reduce watering slightly to concentrate sugars in the fruit',
      'Harvest when fully colored but before skin begins to crack',
      'Store ripe tomatoes at room temperature — never refrigerate (destroys flavor)',
      'Green tomatoes can ripen indoors at 18–21°C away from direct sunlight',
      'At season\'s end, remove all fruit and plant debris to prevent overwintering disease',
    ],
    tip: 'The "squeeze test" — a ripe tomato should yield slightly to gentle pressure without being soft. Color alone is not always a reliable indicator, especially with heirloom varieties that may remain partially green when fully ripe.',
  },
];

const BlogSix: React.FC = () => {
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
            source={{ uri: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771770960/a4ac4b97-a677-47fc-bf48-8f2242cd531a.png' }}
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
              <Text style={styles.categoryText}>Growing Guide</Text>
            </View>
            <Text style={styles.heroTitle}>
              The Stages and Timelines of Growing a Tomato
            </Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <FontAwesome5 name="calendar-alt" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>February 15, 2025</Text>
              </View>
              <View style={styles.metaItem}>
                <FontAwesome5 name="clock" size={13} color={COLORS.muted} />
                <Text style={styles.metaText}>11 min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Article Content ───────────────────────────────────────────────── */}
        <View style={styles.contentContainer}>
          <View style={styles.articleContent}>

            {/* Introduction */}
            <Text style={styles.paragraph}>
              Growing tomatoes successfully requires understanding what the plant needs at each distinct phase of its life cycle. From the moment a seed absorbs water to the day a ripe fruit is harvested, the tomato passes through seven interconnected stages — each with specific environmental conditions, nutritional requirements, and care practices that determine the quality and quantity of the final harvest.
            </Text>

            {/* Overview card */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.treatmentCard}
            >
              <FontAwesome5 name="calendar-check" size={32} color={COLORS.color1} />
              <Text style={styles.treatmentTitle}>Full Growing Timeline Overview</Text>
              <Text style={styles.treatmentText}>
                From seed to harvest, most tomato varieties require 90–140 days depending on the cultivar type. Determinate varieties (bush types) have a more compressed timeline and produce fruit all at once. Indeterminate varieties continue growing and producing fruit until killed by frost.
              </Text>
            </LinearGradient>

            {/* Stages */}
            {STAGES.map((stage, index) => (
              <View key={index} style={styles.stageCard}>
                {/* Stage header */}
                <View style={styles.stageHeader}>
                  <View style={styles.stageNumberBadge}>
                    <Text style={styles.stageNumber}>{stage.number}</Text>
                  </View>
                  <View style={styles.stageTitleBlock}>
                    <Text style={styles.stageTitle}>{stage.title}</Text>
                    <View style={styles.timelinePill}>
                      <FontAwesome5 name="clock" size={10} color={COLORS.color1} />
                      <Text style={styles.timelineText}>{stage.timeline}</Text>
                    </View>
                  </View>
                  <View style={styles.stageIconWrap}>
                    <FontAwesome5 name={stage.icon} size={20} color={COLORS.color1} />
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.stageDescription}>{stage.description}</Text>

                {/* Needs */}
                <View style={styles.symptomBox}>
                  <Text style={styles.symptomTitle}>What the Plant Needs:</Text>
                  {stage.needs.map((need, i) => (
                    <Text key={i} style={styles.bulletPoint}>• {need}</Text>
                  ))}
                </View>

                {/* Pro tip */}
                <View style={styles.tipBox}>
                  <FontAwesome5 name="lightbulb" size={13} color={COLORS.color1} />
                  <Text style={styles.tipText}>{stage.tip}</Text>
                </View>
              </View>
            ))}

            {/* Determinate vs Indeterminate */}
            <Text style={styles.sectionTitle}>Determinate vs. Indeterminate Varieties</Text>

            <View style={styles.preventionGrid}>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="compress-arrows-alt" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Determinate (Bush)</Text>
                <Text style={styles.preventionCardText}>
                  Plants grow to a fixed height (typically 60–120cm), flower and set all fruit within a 2–3 week window, then stop growing. Ideal for canning and preserving due to simultaneous ripening. Examples: Roma, Celebrity, Rutgers.
                </Text>
              </View>
              <View style={styles.preventionCard}>
                <FontAwesome5 name="expand-arrows-alt" size={26} color={COLORS.color2} />
                <Text style={styles.preventionCardTitle}>Indeterminate (Vining)</Text>
                <Text style={styles.preventionCardText}>
                  Plants continue growing, flowering, and fruiting until frost kills them — sometimes reaching 3 metres or more. Produce smaller but continuous harvests throughout the season. Examples: Cherry, Beefsteak, Brandywine.
                </Text>
              </View>
            </View>

            {/* Common mistakes */}
            <Text style={styles.sectionTitle}>Common Mistakes at Each Stage</Text>

            <View style={styles.resistanceBox}>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Germination: </Text>Overwatering causes seed rot; cold soil causes delayed or failed germination
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Seedling: </Text>Insufficient light creates leggy, weak transplants that never fully recover
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Transplanting: </Text>Transplanting too early (cold nights) shocks the plant and stunts growth for weeks
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Vegetative: </Text>Too much nitrogen causes lush foliage at the expense of flowering
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Flowering: </Text>High heat (above 32°C) makes pollen sterile, preventing fruit set entirely
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Fruit Development: </Text>Irregular watering causes blossom end rot and skin cracking
              </Text>
              <Text style={styles.resistanceItem}>
                <Text style={styles.bold}>Harvest: </Text>Refrigerating tomatoes destroys the enzymes responsible for flavor and aroma
              </Text>
            </View>

            {/* Conclusion */}
            <LinearGradient
              colors={[COLORS.color5, COLORS.color3]}
              style={styles.conclusionCard}
            >
              <FontAwesome5 name="check-circle" size={44} color={COLORS.color1} />
              <Text style={styles.conclusionTitle}>Every Stage Matters</Text>
              <Text style={styles.conclusionText}>
                A tomato plant is only as strong as the weakest stage of its growth. Investing care and attention at every phase — from choosing the right germination temperature to harvesting at peak ripeness — is what separates a mediocre crop from an exceptional one. With the right knowledge, anyone can grow tomatoes that are vastly superior to anything available at a supermarket.
              </Text>
            </LinearGradient>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                Noticed something unusual on your tomato plants? Use TomatoGuard's disease detection feature or ask our community for help!
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
    width: '100%', height: isSmallDevice ? 300 : 420, position: 'relative',
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
    fontSize: isSmallDevice ? 28 : 38, fontWeight: '700', fontStyle: 'italic',
    color: COLORS.textLight, marginBottom: 16, lineHeight: isSmallDevice ? 36 : 48,
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

  // Stage card
  stageCard: {
    backgroundColor: 'rgba(30,41,59,0.55)', borderRadius: isSmallDevice ? 14 : 18,
    padding: isSmallDevice ? 16 : 22, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', marginVertical: 8,
    gap: 14,
  },
  stageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  stageNumberBadge: {
    width: isSmallDevice ? 38 : 46, height: isSmallDevice ? 38 : 46,
    borderRadius: isSmallDevice ? 10 : 12,
    backgroundColor: COLORS.color3,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.color1,
  },
  stageNumber: {
    fontSize: isSmallDevice ? 13 : 15, fontWeight: '800', color: COLORS.color1,
  },
  stageTitleBlock: { flex: 1, gap: 5 },
  stageTitle: {
    fontSize: isSmallDevice ? 17 : 20, fontWeight: '700',
    color: COLORS.textLight, fontStyle: 'italic',
  },
  timelinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(248,255,118,0.15)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.color1,
  },
  timelineText: {
    fontSize: 11, fontWeight: '700', color: COLORS.color1, letterSpacing: 0.3,
  },
  stageIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: 'rgba(45,119,54,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  stageDescription: {
    fontSize: isSmallDevice ? 14 : 15, lineHeight: isSmallDevice ? 22 : 24, color: COLORS.muted,
  },
  symptomBox: {
    backgroundColor: 'rgba(45,119,54,0.2)', borderRadius: 8,
    padding: 16, borderLeftWidth: 3, borderLeftColor: COLORS.color3, gap: 4,
  },
  symptomTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.textLight, marginBottom: 6,
  },
  bulletPoint: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(248,255,118,0.08)',
    borderRadius: 8, padding: 14,
    borderLeftWidth: 3, borderLeftColor: COLORS.color1,
  },
  tipText: {
    flex: 1, fontSize: 13, color: COLORS.muted,
    lineHeight: 20, fontStyle: 'italic',
  },

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
  resistanceItem: { fontSize: 14, color: COLORS.muted, lineHeight: 22 },
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

export default BlogSix;