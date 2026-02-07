import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SeverityLevel {
  level: string;
  count: number;
  percentage: number;
  avg_score: number;
}

interface Props {
  data: {
    total_diseased: number;
    levels: SeverityLevel[];
  };
  partDistribution: Array<{
    part: string;
    count: number;
    percentage: number;
  }>;
}

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Moderate: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

const PART_COLORS: Record<string, string> = {
  fruit: '#ef4444',
  leaf: '#22c55e',
  stem: '#f59e0b',
};

const PART_ICONS: Record<string, string> = {
  fruit: '🍅',
  leaf: '🍃',
  stem: '🌿',
};

const SeverityBreakdown: React.FC<Props> = ({ data, partDistribution }) => {
  const maxSev = Math.max(...data.levels.map((l) => l.count), 1);
  const maxPart = Math.max(...partDistribution.map((p) => p.count), 1);

  return (
    <View style={s.container}>
      {/* Severity */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Severity Breakdown</Text>
        <Text style={s.subTitle}>
          {data.total_diseased} diseased analyses with severity data
        </Text>

        {data.levels.map((l) => {
          const color = SEVERITY_COLORS[l.level] || '#64748b';
          const barW = maxSev > 0 ? (l.count / maxSev) * 100 : 0;
          return (
            <View key={l.level} style={s.row}>
              <View style={[s.dot, { backgroundColor: color }]} />
              <Text style={[s.levelLabel, { color }]}>{l.level}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${barW}%`, backgroundColor: color }]} />
              </View>
              <Text style={s.count}>{l.count}</Text>
              <Text style={s.pct}>{l.percentage}%</Text>
            </View>
          );
        })}
      </View>

      {/* Plant Part Distribution */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Plant Part Distribution</Text>

        {partDistribution.map((p) => {
          const color = PART_COLORS[p.part] || '#64748b';
          const icon = PART_ICONS[p.part] || '🌱';
          const barW = maxPart > 0 ? (p.count / maxPart) * 100 : 0;
          return (
            <View key={p.part} style={s.row}>
              <Text style={s.partIcon}>{icon}</Text>
              <Text style={[s.levelLabel, { color, textTransform: 'capitalize' }]}>{p.part}</Text>
              <View style={s.barTrack}>
                <View style={[s.barFill, { width: `${barW}%`, backgroundColor: color }]} />
              </View>
              <Text style={s.count}>{p.count}</Text>
              <Text style={s.pct}>{p.percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 24 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  partIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  levelLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  count: {
    width: 30,
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'right',
  },
  pct: {
    width: 40,
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
});

export default SeverityBreakdown;
