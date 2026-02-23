import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  Modal,
  FlatList,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchFeaturedDiseaseSpotlight,
  FeaturedDiseaseSpotlight,
  SpotlightItem,
  SpotlightDailyPoint,
} from '../services/api/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WIDE = SCREEN_WIDTH > 900;

// ── Period filter options ────────────────────────────────────────
const PERIOD_OPTIONS: { label: string; days: number }[] = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

// ── Disease accent colours (keyed by disease name) ──────────────
const DISEASE_COLORS: Record<string, string> = {
  'Bacterial Spot': '#e74c3c',
  'Early Blight': '#d35400',
  'Late Blight': '#8e44ad',
  'Septoria Leaf Spot': '#c0392b',
  'Yellow Leaf Curl': '#f1c40f',
  'Anthracnose': '#e67e22',
  'Botrytis Gray Mold': '#95a5a6',
  'Blossom End Rot': '#2c3e50',
  'Buckeye Rot': '#16a085',
  'Sunscald': '#f39c12',
  'Blight': '#c0392b',
  'Wilt': '#27ae60',
};
const DEFAULT_ACCENT = '#16a34a';

// ── Plant-part badges ───────────────────────────────────────────
const PART_EMOJI: Record<string, string> = {
  leaf: '🍃',
  fruit: '🍅',
  stem: '🌱',
};

const PART_LABEL: Record<string, string> = {
  leaf: 'Leaf',
  fruit: 'Fruit',
  stem: 'Stem',
};

// ── Hardcoded disease sample images (Cloudinary) ────────────────
// Replace placeholder URLs with real images for each disease.
const DISEASE_IMAGES: Record<string, string[]> = {
  // Fruit diseases
  'Anthracnose': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Botrytis Gray Mold': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Blossom End Rot': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Buckeye Rot': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Sunscald': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  // Leaf diseases
  'Bacterial Spot': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Early Blight': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Late Blight': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Septoria Leaf Spot': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Yellow Leaf Curl': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  // Stem diseases
  'Blight': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
  'Wilt': [
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847742/81d23d29-e092-4412-b02b-bade6ea73bc1.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771847780/cc49cc01-86f5-4db0-a41c-18c1ce3e1768.png',
    'https://res.cloudinary.com/dphf7kz4i/image/upload/v1771427784/tomato_guard/adpmtillmw3eezrqsv9d.jpg',
  ],
};

/** Get sample images for a disease from hardcoded map */
const getDiseaseSampleImages = (
  diseaseName?: string,
): { url: string; stage: string; confidence: number }[] => {
  const urls = DISEASE_IMAGES[diseaseName ?? ''] ?? [];
  const stages = ['Early stage', 'Advanced stage', 'Severe infection'];
  return urls.map((url, i) => ({
    url,
    stage: stages[i] ?? `Sample ${i + 1}`,
    confidence: 0,
  }));
};

// ── Helper: resolve accent ──────────────────────────────────────
const accentFor = (name?: string) =>
  name ? DISEASE_COLORS[name] ?? DEFAULT_ACCENT : DEFAULT_ACCENT;

// ─────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────
const TrendScreen: React.FC = () => {
  const { authState } = useAuth();
  const [data, setData] = useState<FeaturedDiseaseSpotlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const load = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        const res = await fetchFeaturedDiseaseSpotlight(
          authState.accessToken || undefined,
          selectedDays,
        );
        setData(res);
      } catch (err: any) {
        console.error('Trends fetch failed:', err);
        setError(
          err?.response?.data?.detail || err.message || 'Failed to load trends',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authState.accessToken, selectedDays],
  );

  useEffect(() => {
    load();
  }, [load]);

  // ── Render guards ──────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={s.loadingText}>Loading disease trends…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <FontAwesome5 name="exclamation-triangle" size={36} color="#ef4444" />
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
          <Text style={s.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data || !data.has_data) {
    return (
      <View style={s.center}>
        <FontAwesome5 name="chart-line" size={48} color="#94a3b8" />
        <Text style={s.emptyTitle}>No detections yet</Text>
        <Text style={s.emptySubtitle}>
          Start scanning your tomato plants to see trends here.
        </Text>
      </View>
    );
  }

  const overall = data.overall!;
  const perPart = data.per_part;
  const overallAccent = accentFor(overall.disease_name);

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.rootContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
      }
    >
      {/* ─── Global Date Filter ─────────────────────────────────── */}
      <View style={s.filterBar}>
        <Text style={s.filterLabel}>Report Period</Text>
        <View style={s.filterPills}>
          {PERIOD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.days}
              style={[
                s.pill,
                selectedDays === opt.days && {
                  backgroundColor: overallAccent,
                },
              ]}
              onPress={() => setSelectedDays(opt.days)}
            >
              <Text
                style={[
                  s.pillText,
                  selectedDays === opt.days && s.pillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
           OVERALL SPOTLIGHT  (hero section)
         ═══════════════════════════════════════════════════════════ */}
      {overall.has_data && (
        <>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTag}>FEATURED DISEASE SPOTLIGHT</Text>
            <Text style={s.sectionHeadline}>
              Most Detected This Period
            </Text>
          </View>

          <SpotlightHero item={overall} accent={overallAccent} />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           PER-PART SPOTLIGHTS
         ═══════════════════════════════════════════════════════════ */}
      {perPart && (
        <>
          <View style={[s.sectionHeader, { marginTop: 32 }]}>
            <Text style={s.sectionTag}>BY PLANT PART</Text>
            <Text style={s.sectionHeadline}>Top Disease Per Part</Text>
          </View>

          <View style={IS_WIDE ? s.partGrid : undefined}>
            {(['leaf', 'fruit', 'stem'] as const).map((part) => {
              const item = perPart[part];
              if (!item || !item.has_data) {
                return (
                  <View key={part} style={[s.partCard, IS_WIDE && s.partCardWide]}>
                    <Text style={s.partCardEmoji}>
                      {PART_EMOJI[part] ?? '🌿'}
                    </Text>
                    <Text style={s.partCardTitle}>
                      {PART_LABEL[part]} — No Data
                    </Text>
                    <Text style={s.partCardSub}>
                      No diseased detections for this part in the selected
                      period.
                    </Text>
                  </View>
                );
              }
              return (
                <PartSpotlightCard
                  key={part}
                  part={part}
                  item={item}
                />
              );
            })}
          </View>
        </>
      )}

      {/* Bottom spacer for floating button */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ── Overall Spotlight Hero ───────────────────────────────────────
const SpotlightHero: React.FC<{ item: SpotlightItem; accent: string }> = ({
  item,
  accent,
}) => {
  const stats = item.stats!;
  const trendSymbol = stats.trend === 'up' ? '↑' : '↓';
  const trendColor = stats.trend === 'up' ? '#ef4444' : '#22c55e';
  const resolvedImages = useMemo(
    () => getDiseaseSampleImages(item.disease_name),
    [item.disease_name],
  );

  return (
    <>
      {/* Disease name plaque */}
      <View style={[s.diseaseNameContainer, { borderLeftColor: accent }]}>
        <Text style={s.partBadge}>
          {PART_EMOJI[item.plant_part ?? ''] ?? '🌿'}{' '}
          {(item.plant_part ?? '').toUpperCase()}
        </Text>
        <Text style={[s.diseaseName, { color: accent }]}>
          {item.disease_name}
        </Text>
      </View>

      {/* ── Daily Trend Line Chart ──────────────────────────── */}
      {(item.daily_trend?.length ?? 0) > 1 && (
        <DailyTrendLineChart data={item.daily_trend!} accent={accent} />
      )}

      {/* Two-column (wide) / stacked (narrow) layout */}
      <View style={IS_WIDE ? s.columnsRow : undefined}>
        {/* LEFT: info cards */}
        <View style={IS_WIDE ? s.columnLeft : undefined}>
          <InfoCard icon="virus" label="CAUSE" accent={accent}>
            <Text style={s.cardBody}>{item.cause}</Text>
          </InfoCard>

          <InfoCard icon="align-left" label="DESCRIPTION" accent={accent}>
            <Text style={s.cardBody}>{item.description}</Text>
          </InfoCard>

          {(item.environmental_triggers?.length ?? 0) > 0 && (
            <InfoCard
              icon="cloud-sun-rain"
              label="ENVIRONMENTAL TRIGGERS"
              accent={accent}
            >
              {item.environmental_triggers!.map((t, i) => (
                <BulletRow key={i} text={t} accent={accent} />
              ))}
            </InfoCard>
          )}

          {(item.prevention_tips?.length ?? 0) > 0 && (
            <InfoCard
              icon="shield-alt"
              label="QUICK PREVENTION"
              accent={accent}
            >
              {item.prevention_tips!.map((t, i) => (
                <BulletRow key={i} text={t} accent={accent} />
              ))}
            </InfoCard>
          )}
        </View>

        {/* RIGHT: stats + sample images */}
        <View style={IS_WIDE ? s.columnRight : undefined}>
          <StatsCard stats={stats} accent={accent} trendColor={trendColor} trendSymbol={trendSymbol} />

          {/* Auto-sliding sample images */}
          {resolvedImages.length > 0 && (
            <AutoSlideshow images={resolvedImages} accent={accent} />
          )}
        </View>
      </View>
    </>
  );
};

// ── Per-Part Compact Card ────────────────────────────────────────
const PartSpotlightCard: React.FC<{
  part: string;
  item: SpotlightItem;
}> = ({ part, item }) => {
  const accent = accentFor(item.disease_name);
  const stats = item.stats;
  const trendSymbol = stats?.trend === 'up' ? '↑' : '↓';
  const trendColor = stats?.trend === 'up' ? '#ef4444' : '#22c55e';

  return (
    <View style={[s.partCard, IS_WIDE && s.partCardWide, { borderTopColor: accent }]}>
      {/* Header */}
      <View style={s.partCardHeader}>
        <Text style={s.partCardEmoji}>{PART_EMOJI[part] ?? '🌿'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.partCardPartLabel}>
            {PART_LABEL[part]?.toUpperCase()}
          </Text>
          <Text style={[s.partCardDisease, { color: accent }]}>
            {item.disease_name}
          </Text>
        </View>
      </View>

      {/* Quick stats row */}
      {stats && (
        <View style={s.miniStatsRow}>
          <View style={s.miniStat}>
            <Text style={s.miniStatValue}>{stats.total_detections}</Text>
            <Text style={s.miniStatLabel}>Detections</Text>
          </View>
          <View style={s.miniStat}>
            <Text style={[s.miniStatValue, { color: trendColor }]}>
              {trendSymbol} {stats.vs_last_period_pct}%
            </Text>
            <Text style={s.miniStatLabel}>vs last period</Text>
          </View>
          <View style={s.miniStat}>
            <Text style={s.miniStatValue}>
              {(stats.avg_confidence * 100).toFixed(0)}%
            </Text>
            <Text style={s.miniStatLabel}>Avg Conf.</Text>
          </View>
        </View>
      )}

      {/* Cause (one-liner) */}
      {item.cause && (
        <View style={s.partInfoRow}>
          <FontAwesome5 name="virus" size={11} color={accent} style={{ marginRight: 6 }} />
          <Text style={s.partInfoText} numberOfLines={2}>
            {item.cause}
          </Text>
        </View>
      )}

      {/* Prevention (first tip) */}
      {(item.prevention_tips?.length ?? 0) > 0 && (
        <View style={s.partInfoRow}>
          <FontAwesome5 name="shield-alt" size={11} color={accent} style={{ marginRight: 6 }} />
          <Text style={s.partInfoText} numberOfLines={2}>
            {item.prevention_tips![0]}
          </Text>
        </View>
      )}

      {/* Sample image thumbnail strip */}
      {(item.sample_images?.length ?? 0) > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.partImageStrip}
        >
          {item.sample_images!.slice(0, 3).map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.url }}
              style={s.partThumb}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

// ── Daily Trend Line Chart (interactive date-range) ──────────────
const CHART_HEIGHT = 180;
const CHART_PADDING_TOP = 20;
const CHART_PADDING_BOTTOM = 28;
const CHART_PADDING_LEFT = 36;
const CHART_PADDING_RIGHT = 12;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Format "YYYY-MM-DD" → "Feb 23" */
const fmtShort = (d: string) => {
  const [, m, day] = d.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${parseInt(day, 10)}`;
};
/** Format "YYYY-MM-DD" → "Feb 23, 2026" */
const fmtLong = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
};
/** Weekday name from "YYYY-MM-DD" */
const weekday = (d: string) => {
  const dt = new Date(d + 'T00:00:00');
  return DAY_NAMES[dt.getDay()];
};

const DailyTrendLineChart: React.FC<{
  data: SpotlightDailyPoint[];
  accent: string;
}> = ({ data, accent }) => {
  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(data.length - 1);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  // ── Measure the card's actual rendered width ─────────────────
  const [containerWidth, setContainerWidth] = useState(0);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // ── Quick-range presets ──────────────────────────────────────
  const presets = useMemo(() => {
    const len = data.length;
    const list: { label: string; start: number; end: number }[] = [
      { label: 'All', start: 0, end: len - 1 },
    ];
    if (len > 7) list.push({ label: '7 d', start: len - 7, end: len - 1 });
    if (len > 14) list.push({ label: '14 d', start: len - 14, end: len - 1 });
    if (len > 30) list.push({ label: '30 d', start: len - 30, end: len - 1 });
    return list;
  }, [data.length]);

  const isPresetActive = (p: { start: number; end: number }) =>
    startIdx === p.start && endIdx === p.end;

  // ── Dates grouped by month (for picker modal) ───────────────
  const datesByMonth = useMemo(() => {
    const groups: {
      month: string;
      items: { idx: number; date: string; count: number }[];
    }[] = [];
    data.forEach((d, idx) => {
      const [y, m] = d.date.split('-');
      const key = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
      let g = groups.find((g) => g.month === key);
      if (!g) {
        g = { month: key, items: [] };
        groups.push(g);
      }
      g.items.push({ idx, date: d.date, count: d.count });
    });
    return groups;
  }, [data]);

  // ── Pick handler ────────────────────────────────────────────
  const handlePick = (idx: number) => {
    if (pickerTarget === 'start') {
      setStartIdx(Math.min(idx, endIdx));
    } else {
      setEndIdx(Math.max(idx, startIdx));
    }
    setPickerTarget(null);
  };

  // ── Visible slice ───────────────────────────────────────────
  const visible = data.slice(startIdx, endIdx + 1);
  const maxCount = Math.max(...visible.map((d) => d.count), 1);
  const totalDetections = visible.reduce((sum, d) => sum + d.count, 0);
  const daySpan = visible.length;

  // ── SVG geometry ────────────────────────────────────────────
  // Use measured containerWidth (minus card padding 16*2=32) so the SVG
  // never exceeds the card's actual bounds — fixes overflow into the modal.
  const chartWidth = containerWidth > 0
    ? Math.max(containerWidth - 32, 200)   // 32 = card padding (16 each side)
    : Math.max(SCREEN_WIDTH - 40 - 32 - 2, 260); // fallback before first layout

  const plotW = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const plotH = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const points = visible.map((d, i) => {
    const x =
      CHART_PADDING_LEFT +
      (visible.length > 1 ? (i / (visible.length - 1)) * plotW : plotW / 2);
    const y = CHART_PADDING_TOP + plotH - (d.count / maxCount) * plotH;
    return { x, y, ...d };
  });

  // Smooth path (Catmull-Rom)
  let pathD = '';
  if (points.length >= 2) {
    pathD = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
  }

  const fillD = pathD
    ? `${pathD} L${points[points.length - 1].x},${CHART_PADDING_TOP + plotH} L${points[0].x},${CHART_PADDING_TOP + plotH} Z`
    : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: Math.round(maxCount * pct),
    y: CHART_PADDING_TOP + plotH - pct * plotH,
  }));

  const labelStep = Math.max(1, Math.floor(visible.length / 5));
  const xLabels = visible
    .map((d, i) => ({ label: d.date.slice(5), i }))
    .filter((_, i) => i % labelStep === 0 || i === visible.length - 1);

  return (
    // onLayout gives us the true rendered width of this card
    <View style={s.chartCard} onLayout={handleContainerLayout}>
      {/* ── Header ──────────────────────────────────────────── */}
      <View style={s.chartHeader}>
        <View style={s.chartHeaderLeft}>
          <FontAwesome5 name="chart-line" size={13} color={accent} />
          <Text style={s.chartTitle}> DETECTION TREND</Text>
        </View>
        <Text style={[s.chartTotal, { color: accent }]}>
          {totalDetections} detections
        </Text>
      </View>

      {/* ── Quick-range presets ─────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.presetRow}
      >
        {presets.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[
              s.presetPill,
              isPresetActive(p) && { backgroundColor: accent },
            ]}
            onPress={() => {
              setStartIdx(p.start);
              setEndIdx(p.end);
            }}
          >
            <Text
              style={[
                s.presetText,
                isPresetActive(p) && { color: '#fff' },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── FROM / TO date selectors ───────────────────────── */}
      <View style={s.dateRangeRow}>
        <TouchableOpacity
          style={[s.dateBtn, { borderColor: accent + '44' }]}
          onPress={() => setPickerTarget('start')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="calendar" size={11} color={accent} />
          <Text style={s.dateBtnLabel}> From</Text>
          <Text style={[s.dateBtnValue, { color: accent }]}>
            {fmtShort(data[startIdx].date)}
          </Text>
        </TouchableOpacity>

        <FontAwesome5
          name="long-arrow-alt-right"
          size={14}
          color="#475569"
          style={{ marginHorizontal: 8 }}
        />

        <TouchableOpacity
          style={[s.dateBtn, { borderColor: accent + '44' }]}
          onPress={() => setPickerTarget('end')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="calendar" size={11} color={accent} />
          <Text style={s.dateBtnLabel}> To</Text>
          <Text style={[s.dateBtnValue, { color: accent }]}>
            {fmtShort(data[endIdx].date)}
          </Text>
        </TouchableOpacity>

        <View style={s.daySpanBadge}>
          <Text style={s.daySpanText}>{daySpan} day{daySpan !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* ── SVG Chart ──────────────────────────────────────── */}
      {/* overflow:hidden clips any stray SVG pixels at the card edge */}
      <View style={{ overflow: 'hidden' }}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          {yTicks.map((t, i) => (
            <React.Fragment key={i}>
              <Line
                x1={CHART_PADDING_LEFT}
                y1={t.y}
                x2={chartWidth - CHART_PADDING_RIGHT}
                y2={t.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
              <SvgText
                x={CHART_PADDING_LEFT - 6}
                y={t.y + 4}
                fill="#64748b"
                fontSize={10}
                textAnchor="end"
              >
                {t.value}
              </SvgText>
            </React.Fragment>
          ))}

          {fillD ? <Path d={fillD} fill={accent} opacity={0.1} /> : null}

          {pathD ? (
            <Path
              d={pathD}
              stroke={accent}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={p.count > 0 ? 3.5 : 2}
              fill={p.count > 0 ? accent : '#475569'}
              stroke={p.count > 0 ? '#0f172a' : 'none'}
              strokeWidth={1.5}
            />
          ))}

          {xLabels.map((lbl) => (
            <SvgText
              key={lbl.i}
              x={points[lbl.i].x}
              y={CHART_HEIGHT - 4}
              fill="#64748b"
              fontSize={9}
              textAnchor="middle"
            >
              {lbl.label}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* ── Date Picker Modal ──────────────────────────────── */}
      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={s.pickerOverlay}>
          <View style={s.pickerSheet}>
            {/* Picker header */}
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>
                Select {pickerTarget === 'start' ? 'Start' : 'End'} Date
              </Text>
              <TouchableOpacity
                onPress={() => setPickerTarget(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <FontAwesome5 name="times" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Date list grouped by month */}
            <FlatList
              data={datesByMonth}
              keyExtractor={(g) => g.month}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item: group }) => (
                <View>
                  <Text style={s.pickerMonthLabel}>{group.month}</Text>
                  {group.items.map((d) => {
                    const isDisabled =
                      pickerTarget === 'start'
                        ? d.idx > endIdx
                        : d.idx < startIdx;
                    const isSelected =
                      pickerTarget === 'start'
                        ? d.idx === startIdx
                        : d.idx === endIdx;

                    return (
                      <TouchableOpacity
                        key={d.idx}
                        style={[
                          s.pickerDateRow,
                          isSelected && { backgroundColor: accent + '22', borderColor: accent },
                          isDisabled && { opacity: 0.35 },
                        ]}
                        activeOpacity={0.6}
                        disabled={isDisabled}
                        onPress={() => handlePick(d.idx)}
                      >
                        <View style={s.pickerDateLeft}>
                          <Text
                            style={[
                              s.pickerDateDay,
                              isSelected && { color: accent },
                            ]}
                          >
                            {fmtLong(d.date)}
                          </Text>
                          <Text style={s.pickerDateWeekday}>
                            {weekday(d.date)}
                          </Text>
                        </View>
                        {d.count > 0 && (
                          <View
                            style={[
                              s.pickerCountBadge,
                              { backgroundColor: accent + '22' },
                            ]}
                          >
                            <Text style={[s.pickerCountText, { color: accent }]}>
                              {d.count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Reusable Info Card ───────────────────────────────────────────
const InfoCard: React.FC<{
  icon: string;
  label: string;
  accent: string;
  children: React.ReactNode;
}> = ({ icon, label, accent, children }) => (
  <View style={s.card}>
    <View style={s.cardLabelRow}>
      <FontAwesome5 name={icon} size={14} color={accent} />
      <Text style={s.cardLabel}> {label}</Text>
    </View>
    {children}
  </View>
);

// ── Reusable Stats Card ──────────────────────────────────────────
const StatsCard: React.FC<{
  stats: NonNullable<SpotlightItem['stats']>;
  accent: string;
  trendColor: string;
  trendSymbol: string;
}> = ({ stats, accent, trendColor, trendSymbol }) => (
  <View style={[s.card, s.statsCard]}>
    <Text style={s.statsTitle}>Detection Statistics</Text>

    <View style={s.statRow}>
      <Text style={s.statLabel}>Total detections this period</Text>
      <Text style={[s.statValue, { color: accent }]}>
        {stats.total_detections}
      </Text>
    </View>
    <View style={s.divider} />

    <View style={s.statRow}>
      <Text style={s.statLabel}>Compared to last period</Text>
      <View style={s.trendBadge}>
        <Text style={[s.trendText, { color: trendColor }]}>
          {trendSymbol} {stats.vs_last_period_pct}%
        </Text>
      </View>
    </View>
    <View style={s.divider} />

    <View style={s.statRow}>
      <Text style={s.statLabel}>Peak detection week</Text>
      <Text style={s.statValueSmall}>{stats.peak_week}</Text>
    </View>
    <View style={s.divider} />

    <View style={s.statRow}>
      <Text style={s.statLabel}>Avg. confidence</Text>
      <Text style={s.statValueSmall}>
        {(stats.avg_confidence * 100).toFixed(1)}%
      </Text>
    </View>
  </View>
);

// ── Auto-Sliding Sample Images Section ───────────────────────────
const AUTO_SLIDE_INTERVAL = 4000; // ms between slides

const AutoSlideshow: React.FC<{
  images: { url: string; stage: string; confidence: number }[];
  accent: string;
}> = ({ images, accent }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevIdx = useRef(0);
  
  // Calculate dimensions
  const slideWidth = SCREEN_WIDTH - 32 - (IS_WIDE ? 440 : 0); // Account for padding and potential sidebar
  const imageHeight = slideWidth * 0.35; // 0.35 ratio for ultra-wide appearance

  // Fade effect when slide changes
  useEffect(() => {
    if (prevIdx.current !== activeIdx) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      prevIdx.current = activeIdx;
    }
  }, [activeIdx, fadeAnim]);

  // Auto-advance timer
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

  const activeImage = images[activeIdx];

  return (
    <View style={s.slideshowCard}>
      {/* Full bleed image with gradient overlay */}
      <View style={s.slideshowImageContainer}>
        <Animated.Image
          source={{ uri: activeImage.url }}
          style={[s.slideshowImage, { height: imageHeight, opacity: fadeAnim }]}
          resizeMode="cover"
        />
        {/* Dark gradient overlay */}
        <View style={s.slideshowGradient} />

        {/* Header label in top-left */}
        <View style={s.slideshowTopLabel}>
          <View style={[s.topLabelAccent, { backgroundColor: accent }]} />
          <FontAwesome5 name="images" size={13} color="#fff" />
          <Text style={s.topLabelText}>SAMPLE DETECTIONS</Text>
        </View>

        {/* Bottom overlay with stage info */}
        <Animated.View style={[s.slideshowBottomOverlay, { opacity: fadeAnim }]}>
          <View style={[s.stageBadge, { backgroundColor: accent, borderColor: accent + '44' }]}>
            <Text style={s.stageBadgeText}>{activeImage.stage}</Text>
          </View>

          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={s.dotsRow}>
              {images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveIdx(i)}>
                  <View
                    style={[
                      s.dot,
                      i === activeIdx
                        ? { backgroundColor: accent, width: 20 }
                        : { backgroundColor: 'rgba(255,255,255,0.35)' },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

// ── Bullet Row ───────────────────────────────────────────────────
const BulletRow: React.FC<{ text: string; accent: string }> = ({
  text,
  accent,
}) => (
  <View style={s.bulletRow}>
    <Text style={[s.bulletDot, { color: accent }]}>●</Text>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  rootContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Shared layout ──────────────────────────────────────────────
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    color: '#f87171',
    fontSize: 15,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyTitle: {
    marginTop: 16,
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: 6,
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },

  // ── Filter bar ─────────────────────────────────────────────────
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 10,
  },
  filterLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginRight: 8,
  },
  filterPills: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#fff' },

  // ── Section header ─────────────────────────────────────────────
  sectionHeader: { marginBottom: 12 },
  sectionTag: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionHeadline: {
    color: '#e2e8f0',
    fontSize: 22,
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // ── Disease name plaque (hero) ─────────────────────────────────
  diseaseNameContainer: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  partBadge: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: IS_WIDE ? 48 : 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: IS_WIDE ? 52 : 40,
  },

  // ── Multi-column grid (hero) ───────────────────────────────────
  columnsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  columnLeft: { flex: 1 },
  columnRight: { flex: 1 },

  // ── Cards ──────────────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardBody: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
  },

  // ── Bullet lists ───────────────────────────────────────────────
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingRight: 8,
  },
  bulletDot: {
    fontSize: 8,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },

  // ── Stats card ─────────────────────────────────────────────────
  statsCard: {
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }
      : {}),
  } as any,
  statsTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  statValueSmall: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  trendText: {
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },

  // ── Line chart card ────────────────────────────────────────────
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chartTotal: {
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Quick-range presets row ────────────────────────────────────
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  presetText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Date range selectors ──────────────────────────────────────
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 4,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dateBtnLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 4,
  },
  dateBtnValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  daySpanBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  daySpanText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Date picker modal ─────────────────────────────────────────
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  pickerTitle: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '700',
  },
  pickerMonthLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  pickerDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 2,
  },
  pickerDateLeft: {
    flex: 1,
  },
  pickerDateDay: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerDateWeekday: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  pickerCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pickerCountText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // ── Auto-slideshow card ────────────────────────────────────────
  slideshowCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  slideshowImageContainer: {
    position: 'relative',
  },
  slideshowImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  slideshowGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  slideshowTopLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topLabelAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  topLabelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  slideshowBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },

  // ── Per-part grid ──────────────────────────────────────────────
  partGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  partCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 3,
    borderTopColor: DEFAULT_ACCENT,
    padding: 16,
    marginBottom: 16,
  },
  partCardWide: {
    flex: 1,
    minWidth: 260,
  },
  partCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  partCardEmoji: {
    fontSize: 28,
  },
  partCardTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  partCardSub: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  partCardPartLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  partCardDisease: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },

  // ── Mini stats row (per-part card) ─────────────────────────────
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniStatValue: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '800',
  },
  miniStatLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Part info rows ─────────────────────────────────────────────
  partInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 4,
  },
  partInfoText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Part thumbnail strip ───────────────────────────────────────
  partImageStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  partThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default TrendScreen;