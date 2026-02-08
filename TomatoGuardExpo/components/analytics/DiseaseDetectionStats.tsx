import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DiseaseItem {
  disease: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

interface Props {
  data: {
    total: number;
    by_part: Record<string, DiseaseItem[]>;
  };
}

const PART_LABELS: Record<string, string> = {
  fruit: '🍅 Fruit Diseases',
  leaf: '🍃 Leaf Diseases',
  stem: '🌿 Stem Diseases',
};

const PART_COLORS: Record<string, string> = {
  fruit: '#ef4444',
  leaf: '#22c55e',
  stem: '#f59e0b',
};

const DiseaseDetectionStats: React.FC<Props> = ({ data }) => {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Disease Detection Statistics</Text>
      <Text style={s.subTitle}>
        All diseases across all models — {data.total} total analyses
      </Text>

      {['fruit', 'leaf', 'stem'].map((part) => {
        const diseases = data.by_part[part] || [];
        const partColor = PART_COLORS[part];

        return (
          <View key={part} style={s.partBlock}>
            <Text style={[s.partTitle, { color: partColor }]}>{PART_LABELS[part]}</Text>

            {/* Header */}
            <View style={s.headerRow}>
              <Text style={[s.hCell, { flex: 2.5 }]}>Disease</Text>
              <Text style={s.hCell}>Count</Text>
              <Text style={s.hCell}>Rate</Text>
              <Text style={[s.hCell, { flex: 1.5 }]}>Avg Conf</Text>
              <Text style={[s.hCell, { flex: 2 }]}>Bar</Text>
            </View>

            {diseases.map((d, i) => {
              const isHealthy = d.disease === 'Healthy';
              const barColor = isHealthy ? '#22c55e' : partColor;
              const maxPct = Math.max(...diseases.map((x) => x.percentage), 1);
              const barWidth = d.percentage > 0 ? (d.percentage / maxPct) * 100 : 0;

              return (
                <View
                  key={d.disease}
                  style={[s.row, i % 2 === 0 ? s.rowEven : null]}
                >
                  <Text
                    style={[
                      s.cell,
                      { flex: 2.5, color: isHealthy ? '#22c55e' : '#e2e8f0' },
                    ]}
                    numberOfLines={1}
                  >
                    {d.disease}
                  </Text>
                  <Text style={[s.cell, { fontWeight: '700' }]}>{d.count}</Text>
                  <Text style={s.cell}>
                    {d.percentage > 0 ? `${d.percentage}%` : '0%'}
                  </Text>
                  <Text style={[s.cell, { flex: 1.5 }]}>
                    {d.avg_confidence > 0
                      ? `${(d.avg_confidence * 100).toFixed(1)}%`
                      : '—'}
                  </Text>
                  <View style={[s.cell, { flex: 2 }]}>
                    <View style={s.barTrack}>
                      <View
                        style={[
                          s.barFill,
                          { width: `${barWidth}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  partBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  partTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 4,
  },
  hCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  rowEven: {
    backgroundColor: '#162032',
    borderRadius: 4,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#94a3b8',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
});

export default DiseaseDetectionStats;
