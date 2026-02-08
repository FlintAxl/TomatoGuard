import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface ModelData {
  accuracy: number;
  loss: number | null;
  avg_confidence: number | null;
  per_class: Record<string, any>;
}

interface Props {
  data: {
    overall_accuracy: number;
    models: Record<string, ModelData>;
  };
}

interface ScatterPoint {
  x: number;
  y: number;
  model: string;
  displayName: string;
  color: string;
  accuracy: number;
}

const MODEL_CONFIG: Record<string, { displayName: string; color: string; cluster: number }> = {
  part_classifier: { displayName: 'Part Classifier', color: '#8b5cf6', cluster: 0 },
  fruit: { displayName: 'Fruit Model', color: '#ef4444', cluster: 1 },
  leaf: { displayName: 'Leaf Model', color: '#22c55e', cluster: 1 },
  stem: { displayName: 'Stem Model', color: '#f59e0b', cluster: 1 },
};

const ModelAccuracyScatterPlot: React.FC<Props> = ({ data }) => {
  const animatedValues = useRef<Record<string, Animated.Value>>({});
  
  // Initialize animations
  Object.keys(MODEL_CONFIG).forEach(key => {
    if (!animatedValues.current[key]) {
      animatedValues.current[key] = new Animated.Value(0);
    }
  });

  useEffect(() => {
    // Stagger the animations
    const animations = Object.keys(MODEL_CONFIG).map((key, index) => 
      Animated.timing(animatedValues.current[key], {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      })
    );
    
    Animated.sequence(animations).start();
  }, []);

  // Prepare scatter points
  const points: ScatterPoint[] = Object.entries(data.models)
    .filter(([key]) => MODEL_CONFIG[key])
    .map(([key, model]) => {
      const config = MODEL_CONFIG[key];
      // X position: cluster 0 (part classifier) at 0.2, cluster 1 (disease models) at 0.8
      const baseX = config.cluster === 0 ? 0.2 : 0.8;
      // Add small random offset for cluster 1 to separate overlapping points
      const xOffset = config.cluster === 1 ? (Math.random() - 0.5) * 0.15 : 0;
      
      return {
        x: Math.max(0.1, Math.min(0.9, baseX + xOffset)),
        y: (model.accuracy - 0.85) / 0.15, // Scale to 85%-100% range
        model: key,
        displayName: config.displayName,
        color: config.color,
        accuracy: model.accuracy,
      };
    });

  // Chart dimensions
  const chartWidth = 280;
  const chartHeight = 160;
  const padding = 20;

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Model Accuracy Distribution</Text>
      <Text style={s.subTitle}>Interactive scatter plot of all model accuracies</Text>

      <View style={s.chartCard}>
        {/* Y-axis labels */}
        <View style={s.yAxisContainer}>
          <Text style={s.yLabel}>100%</Text>
          <Text style={s.yLabel}>95%</Text>
          <Text style={s.yLabel}>90%</Text>
          <Text style={s.yLabel}>85%</Text>
        </View>

        {/* Chart area */}
        <View style={[s.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((y, i) => (
            <View
              key={i}
              style={[s.gridLine, { top: y * chartHeight, width: chartWidth }]}
            />
          ))}

          {/* Cluster separators */}
          <View style={[s.clusterLine, { left: chartWidth * 0.5, height: chartHeight }]} />

          {/* Scatter points */}
          {points.map((point) => {
            const animatedValue = animatedValues.current[point.model];
            const left = point.x * (chartWidth - 20) + 10;
            const top = (1 - point.y) * (chartHeight - 20) + 10;

            return (
              <Animated.View
                key={point.model}
                style={[
                  s.pointContainer,
                  { left, top },
                  {
                    transform: [
                      {
                        scale: animatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                    opacity: animatedValue,
                  },
                ]}
              >
                <TouchableOpacity style={s.point} activeOpacity={0.7}>
                  <View
                    style={[
                      s.dot,
                      { backgroundColor: point.color, shadowColor: point.color },
                    ]}
                  />
                  <View style={s.tooltip}>
                    <Text style={s.tooltipText}>
                      {point.displayName}: {(point.accuracy * 100).toFixed(1)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={s.xAxisContainer}>
          <Text style={s.xLabel}>Part Classifier</Text>
          <Text style={s.xLabel}>Disease Models</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={s.legend}>
        {points.map((point) => (
          <View key={point.model} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: point.color }]} />
            <Text style={s.legendText}>{point.displayName}</Text>
          </View>
        ))}
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
    height: 160,
    justifyContent: 'space-between',
    paddingVertical: 10,
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
    backgroundColor: '#334155',
    opacity: 0.3,
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
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltip: {
    position: 'absolute',
    top: 22,
    left: -30,
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    opacity: 0,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 10,
    color: '#f9fafb',
    fontWeight: '600',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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