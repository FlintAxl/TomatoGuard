import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OverviewData {
  total_analyses: number;
  today_analyses: number;
  healthy_count: number;
  diseased_count: number;
  avg_confidence: number;
  low_confidence_count: number;
  high_confidence_count: number;
}

interface Props {
  data: OverviewData;
}

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) => (
  <View style={[s.card, { borderLeftColor: color }]}>  
    <Text style={s.cardValue}>{value}</Text>
    <Text style={s.cardLabel}>{label}</Text>
    {sub ? <Text style={s.cardSub}>{sub}</Text> : null}
  </View>
);

const MLOverviewCards: React.FC<Props> = ({ data }) => {
  const healthyPct = data.total_analyses > 0
    ? ((data.healthy_count / data.total_analyses) * 100).toFixed(1)
    : '0';
  const diseasedPct = data.total_analyses > 0
    ? ((data.diseased_count / data.total_analyses) * 100).toFixed(1)
    : '0';

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Overview</Text>
      <View style={s.grid}>
        <StatCard label="Total Analyses" value={data.total_analyses} color="#6366f1" />
        <StatCard label="Today" value={data.today_analyses} color="#22d3ee" />
        <StatCard label="Healthy" value={data.healthy_count} sub={`${healthyPct}%`} color="#22c55e" />
        <StatCard label="Diseased" value={data.diseased_count} sub={`${diseasedPct}%`} color="#ef4444" />
        <StatCard label="Avg Confidence" value={`${(data.avg_confidence * 100).toFixed(1)}%`} color="#f59e0b" />
        <StatCard label="High Conf (≥90%)" value={data.high_confidence_count} color="#10b981" />
        <StatCard label="Low Conf (<60%)" value={data.low_confidence_count} color="#f87171" />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    minWidth: 140,
    flex: 1,
    borderLeftWidth: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
  },
  cardLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});

export default MLOverviewCards;
