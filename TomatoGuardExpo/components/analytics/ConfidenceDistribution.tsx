import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  data: {
    buckets: Array<{ label: string; count: number }>;
    per_disease: Array<{
      disease: string;
      avg_confidence: number;
      count: number;
    }>;
  };
}

const BUCKET_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981'];

const ConfidenceDistribution: React.FC<Props> = ({ data }) => {
  const maxBucket = Math.max(...data.buckets.map((b) => b.count), 1);
  const totalBucket = data.buckets.reduce((s, b) => s + b.count, 0);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Confidence Distribution</Text>

      {/* Bucket histogram */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Confidence Ranges</Text>
        {data.buckets.map((b, i) => {
          const pct = totalBucket > 0 ? ((b.count / totalBucket) * 100).toFixed(1) : '0';
          const barW = maxBucket > 0 ? (b.count / maxBucket) * 100 : 0;
          return (
            <View key={i} style={s.bucketRow}>
              <Text style={s.bucketLabel}>{b.label}</Text>
              <View style={s.bucketBarTrack}>
                <View
                  style={[s.bucketBarFill, { width: `${barW}%`, backgroundColor: BUCKET_COLORS[i] }]}
                />
              </View>
              <Text style={s.bucketCount}>{b.count}</Text>
              <Text style={s.bucketPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>

      {/* Per-disease avg confidence */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Average Confidence per Disease</Text>
        {data.per_disease.map((d) => {
          const confPct = (d.avg_confidence * 100).toFixed(1);
          const barColor =
            d.avg_confidence >= 0.9 ? '#22c55e' : d.avg_confidence >= 0.7 ? '#f59e0b' : '#ef4444';
          return (
            <View key={d.disease} style={s.diseaseRow}>
              <Text style={[s.diseaseName, d.disease === 'Healthy' && { color: '#22c55e' }]}>
                {d.disease}
              </Text>
              <View style={s.diseaseBarTrack}>
                <View
                  style={[
                    s.diseaseBarFill,
                    { width: `${d.avg_confidence * 100}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={[s.diseasePct, { color: barColor }]}>{confPct}%</Text>
              <Text style={s.diseaseCount}>({d.count})</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bucketLabel: {
    width: 60,
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  bucketBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bucketBarFill: {
    height: 10,
    borderRadius: 5,
  },
  bucketCount: {
    width: 30,
    fontSize: 11,
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'right',
  },
  bucketPct: {
    width: 40,
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  diseaseName: {
    width: 130,
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  diseaseBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  diseaseBarFill: {
    height: 8,
    borderRadius: 4,
  },
  diseasePct: {
    width: 45,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  diseaseCount: {
    width: 30,
    fontSize: 10,
    color: '#475569',
    textAlign: 'right',
  },
});

export default ConfidenceDistribution;
