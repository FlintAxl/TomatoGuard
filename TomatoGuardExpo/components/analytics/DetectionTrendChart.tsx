import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface TrendPoint {
  date: string;
  count: number;
}

interface Props {
  data: {
    days: number;
    trends: Record<string, TrendPoint[]>;
  };
}

const TAB_CONFIG: { key: string; label: string; color: string }[] = [
  { key: 'total', label: 'Total', color: '#6366f1' },
  { key: 'fruit', label: 'Fruit', color: '#ef4444' },
  { key: 'leaf', label: 'Leaf', color: '#22c55e' },
  { key: 'stem', label: 'Stem', color: '#f59e0b' },
];

const DetectionTrendChart: React.FC<Props> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('total');

  const points = data.trends[activeTab] || [];
  const activeColor = TAB_CONFIG.find((t) => t.key === activeTab)?.color || '#6366f1';

  // Show last 14 days for readability
  const visiblePoints = points.slice(-14);
  const maxCount = Math.max(...visiblePoints.map((p) => p.count), 1);
  const totalInPeriod = visiblePoints.reduce((sum, p) => sum + p.count, 0);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Detection Trends</Text>

      {/* Tab selector */}
      <View style={s.tabs}>
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                s.tab,
                isActive && { backgroundColor: tab.color + '22', borderColor: tab.color },
              ]}
            >
              <Text style={[s.tabText, isActive && { color: tab.color, fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Last 14 days</Text>
        <Text style={[s.summaryValue, { color: activeColor }]}>{totalInPeriod} analyses</Text>
      </View>

      {/* Chart (vertical bars) */}
      <View style={s.chartCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.chartInner}>
            {/* Y-axis labels */}
            <View style={s.yAxis}>
              <Text style={s.yLabel}>{maxCount}</Text>
              <Text style={s.yLabel}>{Math.round(maxCount / 2)}</Text>
              <Text style={s.yLabel}>0</Text>
            </View>

            {/* Bars */}
            <View style={s.barsContainer}>
              {visiblePoints.map((p, i) => {
                const barHeight = maxCount > 0 ? (p.count / maxCount) * 120 : 0;
                const day = p.date.slice(5); // MM-DD
                return (
                  <View key={i} style={s.barColumn}>
                    <View style={s.barWrapper}>
                      {p.count > 0 && (
                        <Text style={[s.barCountLabel, { color: activeColor }]}>{p.count}</Text>
                      )}
                      <View
                        style={[
                          s.bar,
                          {
                            height: Math.max(barHeight, p.count > 0 ? 4 : 0),
                            backgroundColor: activeColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.barDate}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
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
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
  },
  tabText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
  },
  chartInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 160,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 140,
    marginRight: 8,
    paddingBottom: 18,
  },
  yLabel: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'right',
    width: 24,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barColumn: {
    alignItems: 'center',
    width: 30,
  },
  barWrapper: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 18,
    borderRadius: 4,
    minWidth: 18,
  },
  barCountLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  barDate: {
    fontSize: 9,
    color: '#475569',
    marginTop: 4,
    transform: [{ rotate: '-45deg' }],
  },
});

export default DetectionTrendChart;
