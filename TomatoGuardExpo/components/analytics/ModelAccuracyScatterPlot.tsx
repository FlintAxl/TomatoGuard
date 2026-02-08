import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface AnalysisPoint {
  id: string;
  disease: string;
  confidence: number;
  plant_part: string;
  created_at: string;
  days_ago: number;
}

interface Props {
  data: AnalysisPoint[];
}

interface ScatterPoint extends AnalysisPoint {
  x: number; // normalized position (0-1)
  y: number; // normalized position (0-1)
  color: string;
  displayName: string;
}

const PLANT_PART_CONFIG: Record<string, { displayName: string; color: string }> = {
  fruit: { displayName: 'Fruit Analysis', color: '#ef4444' },
  leaf: { displayName: 'Leaf Analysis', color: '#22c55e' },
  stem: { displayName: 'Stem Analysis', color: '#f59e0b' },
  part: { displayName: 'Part Classification', color: '#8b5cf6' },
};

const ModelAccuracyScatterPlot: React.FC<Props> = ({ data }) => {
  const [selectedPoint, setSelectedPoint] = useState<ScatterPoint | null>(null);
  const animatedValues = useRef<Record<string, Animated.Value>>({});
  
  // Initialize animations for each point
  useEffect(() => {
    data.forEach((_, index) => {
      if (!animatedValues.current[index]) {
        animatedValues.current[index] = new Animated.Value(0);
      }
    });
  }, [data]);

  useEffect(() => {
    // Stagger animations for points
    const animations = data.map((_, index) => 
      Animated.timing(animatedValues.current[index], {
        toValue: 1,
        duration: 400,
        delay: Math.min(index * 20, 1000), // Cap delay to avoid too long waits
        useNativeDriver: true,
      })
    );
    Animated.sequence(animations).start();
  }, [data]);

  // Transform analysis data into scatter points
  const points: ScatterPoint[] = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((analysis, index) => {
      const plantPartKey = analysis.plant_part?.toLowerCase() || 'part';
      const config = PLANT_PART_CONFIG[plantPartKey] || PLANT_PART_CONFIG.part;
      
      // X-axis: Plant part clusters with jitter for visual separation
      let baseX = 0.5; // Default center
      switch (plantPartKey) {
        case 'fruit': baseX = 0.2; break;
        case 'leaf': baseX = 0.5; break;
        case 'stem': baseX = 0.8; break;
        case 'part': baseX = 0.35; break;
      }
      
      // Add random jitter within cluster for visual separation
      const jitter = (Math.random() - 0.5) * 0.25;
      const x = Math.max(0.05, Math.min(0.95, baseX + jitter));
      
      // Y-axis: confidence (higher = top) - confidence is already 0.0-1.0
      const y = analysis.confidence || 0;

      return {
        ...analysis,
        x,
        y: Math.max(0, Math.min(1, y)),
        color: config.color,
        displayName: config.displayName,
      };
    });
  }, [data]);

  const chartWidth = 280;
  const chartHeight = 200;
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Analysis Confidence Distribution</Text>
      <Text style={s.subTitle}>Plant part clustering by confidence levels ({points.length} analyses)</Text>

      <View style={s.chartCard}>
        {/* Y-axis labels */}
        <View style={s.yAxisContainer}>
          <Text style={s.yLabel}>100%</Text>
          <Text style={s.yLabel}>75%</Text>
          <Text style={s.yLabel}>50%</Text>
          <Text style={s.yLabel}>25%</Text>
          <Text style={s.yLabel}>0%</Text>
        </View>

        {/* Chart area */}
        <View style={[s.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines - positioned at 0%, 25%, 50%, 75%, 100% */}
          {[0, 0.25, 0.5, 0.75, 1].map((y, i) => (
            <View
              key={`grid-${i}`}
              style={[s.gridLine, { top: y * chartHeight, width: chartWidth }]}
            />
          ))}

          {/* Scatter points */}
          {points.map((point, index) => {
            const animatedValue = animatedValues.current[index];
            const left = point.x * (chartWidth - 20) + 10;
            // Map confidence to chart height: 100% = top (0), 0% = bottom (chartHeight)
            const top = (1 - point.y) * chartHeight;
            // Clamp to chart bounds with small padding
            const clampedTop = Math.max(5, Math.min(chartHeight - 5, top));

            return (
              <Animated.View
                key={`${point.id}-${index}`}
                style={[
                  s.pointContainer,
                  { left, top: clampedTop },
                  {
                    transform: [
                      {
                        scale: animatedValue ? animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }) : 1,
                      },
                    ],
                    opacity: animatedValue || 1,
                  },
                ]}
              >
                <TouchableOpacity 
                  style={s.point} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedPoint(selectedPoint?.id === point.id ? null : point)}
                >
                  <View
                    style={[
                      s.dot,
                      { backgroundColor: point.color, shadowColor: point.color },
                    ]}
                  />
                  {selectedPoint?.id === point.id && (
                    <View style={s.tooltip}>
                      <Text style={s.tooltipText}>
                        {point.disease} ({point.displayName})
                      </Text>
                      <Text style={s.tooltipSubText}>
                        Confidence: {(point.confidence).toFixed(1)}%
                      </Text>
                      <Text style={s.tooltipSubText}>
                        Plant Part: {point.plant_part}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={s.xAxisContainer}>
          <Text style={s.xLabel}>Fruit</Text>
          <Text style={s.xLabel}>Leaf</Text>
          <Text style={s.xLabel}>Stem</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        {Object.entries(PLANT_PART_CONFIG).map(([key, config]) => {
          const count = points.filter(p => p.plant_part?.toLowerCase() === key).length;
          if (count === 0) return null;
          
          return (
            <View key={key} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: config.color }]} />
              <Text style={s.legendText}>{config.displayName} ({count})</Text>
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
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  yAxisContainer: {
    position: 'absolute',
    left: 8,
    top: 16,
    height: 200,
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  yLabel: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'right',
    width: 30,
  },
  chartArea: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginLeft: 40,
    marginBottom: 16,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#1e293b',
    opacity: 0.6,
  },
  clusterLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#475569',
    opacity: 0.4,
  },
  pointContainer: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
  },
  point: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tooltip: {
    position: 'absolute',
    top: 15,
    left: -40,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  tooltipText: {
    fontSize: 10,
    color: '#f9fafb',
    fontWeight: '700',
    textAlign: 'center',
  },
  tooltipSubText: {
    fontSize: 9,
    color: '#d1d5db',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 2,
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 280,
    paddingHorizontal: 20,
  },
  xLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
});

export default ModelAccuracyScatterPlot;