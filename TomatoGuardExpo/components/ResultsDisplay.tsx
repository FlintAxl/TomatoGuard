import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ResultsDisplayProps {
  results: any;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseResults = (results: any) => {
  if (!results) return { analysis: null, recommendations: null, spotDetection: null };

  let analysis, recommendations, spotDetection;

  if (results.analysis) {
    analysis = results.analysis;
    recommendations = results.analysis?.recommendations;
    spotDetection = results.analysis?.spot_detection;
  } else if (Array.isArray(results) && results.length > 0) {
    const first = results[0];
    analysis = first.analysis ?? first;
    recommendations = analysis?.recommendations;
    spotDetection = analysis?.spot_detection;
  } else if (results.results?.length > 0) {
    const first = results.results[0];
    analysis = first.analysis ?? first;
    recommendations = analysis?.recommendations;
    spotDetection = analysis?.spot_detection;
  } else {
    analysis = results;
    recommendations = results.recommendations;
    spotDetection = results.spot_detection;
  }

  return { analysis, recommendations, spotDetection };
};

const getSeverity = (disease: string, confidence: number) => {
  if (disease.toLowerCase().includes('healthy')) return 'healthy';
  if (confidence > 80) return 'high';
  if (confidence > 60) return 'medium';
  return 'low';
};

const SEVERITY_THEME = {
  healthy: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', badge: '#dcfce7', text: '#15803d' },
  high:    { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', badge: '#fee2e2', text: '#b91c1c' },
  medium:  { color: '#d97706', bg: '#fffbeb', border: '#fde68a', badge: '#fef3c7', text: '#b45309' },
  low:     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', badge: '#dbeafe', text: '#1d4ed8' },
};

const PART_ICON: Record<string, string> = {
  leaf: '🍃',
  fruit: '🍅',
  stem: '🌿',
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const Chip = ({ label, color }: { label: string; color: string }) => (
  <View style={[s.chip, { borderColor: color + '60', backgroundColor: color + '15' }]}>
    <Text style={[s.chipText, { color }]}>{label}</Text>
  </View>
);

const InfoRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <View style={[s.infoRow, last && { borderBottomWidth: 0 }]}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

const SectionLabel = ({ emoji, title }: { emoji: string; title: string }) => (
  <View style={s.sectionLabel}>
    <Text style={s.sectionEmoji}>{emoji}</Text>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const BulletList = ({ items }: { items: string[] }) => (
  <View style={{ gap: 6 }}>
    {items.map((item, idx) => (
      <View key={idx} style={s.bulletItem}>
        <View style={s.bulletDot} />
        <Text style={s.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

// ─── Spot Summary (non-iterating) ────────────────────────────────────────────

const SpotSummary = ({ spotDetection }: { spotDetection: any }) => {
  if (!spotDetection || spotDetection.error) return null;

  const boxes: any[] = spotDetection.bounding_boxes ?? [];
  const total = spotDetection.total_spots ?? boxes.length;
  const topConf = boxes.length > 0 ? (boxes[0]?.confidence * 100).toFixed(0) + '%' : 'N/A';
  const avgArea =
    boxes.length > 0
      ? Math.round(boxes.reduce((s: number, b: any) => s + (b.area ?? 0), 0) / boxes.length)
      : 0;
  const maxArea =
    boxes.length > 0 ? Math.round(Math.max(...boxes.map((b: any) => b.area ?? 0))) : 0;

  return (
    <View style={s.spotSummaryRow}>
      <View style={s.spotStat}>
        <Text style={s.spotStatVal}>{total}</Text>
        <Text style={s.spotStatLbl}>Spots</Text>
      </View>
      <View style={s.spotDivider} />
      <View style={s.spotStat}>
        <Text style={s.spotStatVal}>{topConf}</Text>
        <Text style={s.spotStatLbl}>Top Confidence</Text>
      </View>
      <View style={s.spotDivider} />
      <View style={s.spotStat}>
        <Text style={s.spotStatVal}>{avgArea}px²</Text>
        <Text style={s.spotStatLbl}>Avg Area</Text>
      </View>
      <View style={s.spotDivider} />
      <View style={s.spotStat}>
        <Text style={s.spotStatVal}>{maxArea}px²</Text>
        <Text style={s.spotStatLbl}>Largest</Text>
      </View>
    </View>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  if (!results) {
    return (
      <View style={s.emptyCard}>
        <Text style={s.emptyIcon}>🌱</Text>
        <Text style={s.emptyTitle}>No Analysis Yet</Text>
        <Text style={s.emptyDesc}>Capture or upload an image to begin detection.</Text>
      </View>
    );
  }

  const { analysis, recommendations, spotDetection } = parseResults(results);

  // ── Rejection Screen ───────────────────────────────────────────────────────
  if (analysis?.is_tomato === false) {
    const reason = analysis?.rejection_reason ?? 'This does not appear to be a tomato plant.';
    const scores = analysis?.validation_scores ?? {};

    return (
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <View style={[s.alertBanner, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
          <Text style={s.alertIcon}>🚫</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.alertTitle, { color: '#b91c1c' }]}>Not a Tomato Plant</Text>
            <Text style={[s.alertSub, { color: '#991b1b' }]}>{reason}</Text>
          </View>
        </View>

        {Object.keys(scores).length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Validation Scores</Text>
            {scores.plant_color_ratio !== undefined && (
              <InfoRow label="Plant Color Match" value={`${(scores.plant_color_ratio * 100).toFixed(1)}%`} />
            )}
            {scores.part_confidence !== undefined && (
              <InfoRow label="Part Confidence" value={`${(scores.part_confidence * 100).toFixed(1)}%`} />
            )}
            {scores.texture_score !== undefined && (
              <InfoRow label="Texture Score" value={`${(scores.texture_score * 100).toFixed(1)}%`} last />
            )}
          </View>
        )}

        {(analysis?.recommendations?.suggestions?.length ?? 0) > 0 && (
          <View style={s.card}>
            <SectionLabel emoji="💡" title="Tips for Better Results" />
            <BulletList items={analysis.recommendations.suggestions} />
          </View>
        )}
      </ScrollView>
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  const part = analysis?.part_detection?.part ?? 'Unknown';
  const disease = analysis?.disease_detection?.disease ?? 'Unknown';
  const confidence = parseFloat(((analysis?.disease_detection?.confidence ?? 0) * 100).toFixed(1));
  const partConfidence = parseFloat(((analysis?.part_detection?.confidence ?? 0) * 100).toFixed(1));
  const severity = getSeverity(disease, confidence);
  const theme = SEVERITY_THEME[severity];
  const isHealthy = severity === 'healthy';
  const partIcon = PART_ICON[part?.toLowerCase()] ?? '🌱';

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      {/* ── Status Banner ── */}
      <View style={[s.alertBanner, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        <Text style={s.alertIcon}>{isHealthy ? '✅' : '⚠️'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.alertTitle, { color: theme.text }]}>
            {isHealthy ? 'Plant is Healthy' : disease}
          </Text>
          <Text style={[s.alertSub, { color: theme.color }]}>
            {isHealthy ? 'No disease detected in this image.' : `Detected with ${confidence}% confidence`}
          </Text>
        </View>
        <Chip label={`${confidence}%`} color={theme.color} />
      </View>

      {/* ── Detection Summary ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Detection Summary</Text>
        <InfoRow label="Plant Part" value={`${partIcon}  ${part}`} />
        <InfoRow label="Part Confidence" value={`${partConfidence}%`} />
        <InfoRow label="Disease" value={disease} />
        <InfoRow label="Disease Confidence" value={`${confidence}%`} last />

        {/* Confidence bar */}
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${confidence}%` as any, backgroundColor: theme.color }]} />
        </View>
      </View>

      {/* ── Spot Detection ── */}
      {spotDetection && !spotDetection.error && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Disease Spot Detection</Text>

          {/* Image pair */}
          <View style={s.imagePair}>
            <TouchableOpacity style={s.imageBox} onPress={() => setViewerUri(spotDetection.original_image)}>
              <Image source={{ uri: spotDetection.original_image }} style={s.thumbImage} resizeMode="cover" />
              <Text style={s.thumbLabel}>Original</Text>
            </TouchableOpacity>

            <View style={s.imagePairDivider}>
              <Text style={s.imagePairArrow}>→</Text>
            </View>

            <TouchableOpacity style={s.imageBox} onPress={() => setViewerUri(spotDetection.annotated_image)}>
              <Image source={{ uri: spotDetection.annotated_image }} style={s.thumbImage} resizeMode="cover" />
              <Text style={s.thumbLabel}>Annotated</Text>
            </TouchableOpacity>
          </View>

          {/* Compact stats — no iteration */}
          <SpotSummary spotDetection={spotDetection} />

          <Text style={s.tapHint}>Tap an image to view full screen</Text>
        </View>
      )}

      {/* ── Recommendations ── */}
      {recommendations && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Treatment Recommendations</Text>

          {recommendations.description && (
            <Text style={s.descriptionText}>{recommendations.description}</Text>
          )}

          {(recommendations.immediate_actions?.length ?? 0) > 0 && (
            <View style={s.recoSection}>
              <SectionLabel emoji="🚨" title="Immediate Actions" />
              <BulletList items={recommendations.immediate_actions} />
            </View>
          )}

          {(recommendations.organic_options?.length ?? 0) > 0 && (
            <View style={s.recoSection}>
              <SectionLabel emoji="🌿" title="Organic Options" />
              <BulletList items={recommendations.organic_options} />
            </View>
          )}

          {(recommendations.preventive_measures?.length ?? 0) > 0 && (
            <View style={s.recoSection}>
              <SectionLabel emoji="🛡️" title="Prevention" />
              <BulletList items={recommendations.preventive_measures} />
            </View>
          )}

          {recommendations.confidence?.note && (
            <View style={s.noteBox}>
              <Text style={s.noteText}>📝 {recommendations.confidence.note}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Disclaimer ── */}
      <View style={[s.card, s.disclaimerCard]}>
        <Text style={s.disclaimerTitle}>⚠️ Professional Consultation</Text>
        <Text style={s.disclaimerText}>
          For severe infections or commercial operations, consult a certified agricultural specialist or plant pathologist.
        </Text>
      </View>

      {/* ── Full-Screen Image Viewer ── */}
      <Modal
        visible={!!viewerUri}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerUri(null)}
      >
        <SafeAreaView style={s.viewer}>
          <TouchableOpacity style={s.viewerClose} onPress={() => setViewerUri(null)}>
            <Text style={s.viewerCloseText}>✕</Text>
          </TouchableOpacity>
          {viewerUri && (
            <Image source={{ uri: viewerUri }} style={s.viewerImage} resizeMode="contain" />
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

export default ResultsDisplay;

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },

  // Empty state
  emptyCard: {
    margin: 24, padding: 32, borderRadius: 16, backgroundColor: '#fff',
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  // Alert banner
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
      padding: 8, borderRadius: 10, borderWidth: 1,
  },
  alertIcon: { fontSize: 26 },
  alertTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  alertSub: { fontSize: 13, lineHeight: 18 },

  // Chip
    chip: {
      paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10, borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },

  // Info rows
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1e293b', maxWidth: '55%', textAlign: 'right' },

  // Progress bar
  barTrack: {
    height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, marginTop: 14, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },

  // Image pair
  imagePair: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  imageBox: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f1f5f9' },
  thumbImage: { width: '100%', height: 120 },
  thumbLabel: {
    textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#475569',
    paddingVertical: 6, backgroundColor: '#f8fafc',
  },
  imagePairDivider: { width: 28, alignItems: 'center' },
  imagePairArrow: { fontSize: 18, color: '#94a3b8' },
  tapHint: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 },

  // Spot summary stats
  spotSummaryRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#f8fafc', borderRadius: 12, paddingVertical: 14, marginTop: 4,
  },
  spotStat: { alignItems: 'center', flex: 1 },
  spotStatVal: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  spotStatLbl: { fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: 'center' },
  spotDivider: { width: 1, backgroundColor: '#e2e8f0' },

  // Recommendations
  recoSection: { marginTop: 14 },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionEmoji: { fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  descriptionText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 4 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#94a3b8',
    marginTop: 7, flexShrink: 0,
  },
  bulletText: { fontSize: 13, color: '#475569', lineHeight: 20, flex: 1 },
  noteBox: { marginTop: 14, padding: 12, backgroundColor: '#f8fafc', borderRadius: 10 },
  noteText: { fontSize: 12, color: '#64748b', lineHeight: 18, fontStyle: 'italic' },

  // Disclaimer
  disclaimerCard: { backgroundColor: '#fffbeb' },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: '#78350f', lineHeight: 18 },

  // Full-screen viewer
  viewer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  viewerClose: {
    position: 'absolute', top: 16, right: 16, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  viewerCloseText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewerImage: { width: '100%', height: '80%' },
});