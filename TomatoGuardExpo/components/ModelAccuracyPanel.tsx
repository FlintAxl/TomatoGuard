import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface PerClass {
  precision: number;
  recall: number;
  f1: number;
}

interface ModelData {
  accuracy: number;
  loss: number | null;
  avg_confidence: number | null;
  per_class: Record<string, PerClass>;
}

interface Props {
  data: {
    overall_accuracy: number;
    models: Record<string, ModelData>;
  };
}

const MODEL_LABELS: Record<string, string> = {
  part_classifier: 'Part Classifier',
  fruit: 'Fruit Model',
  leaf: 'Leaf Model',
  stem: 'Stem Model',
};

const MODEL_COLORS: Record<string, string> = {
  part_classifier: '#8b5cf6',
  fruit: '#ef4444',
  leaf: '#22c55e',
  stem: '#f59e0b',
};

const AccuracyBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={s.barRow}>
    <Text style={s.barLabel}>{label}</Text>
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${value * 100}%`, backgroundColor: color }]} />
    </View>
    <Text style={[s.barPct, { color }]}>{(value * 100).toFixed(1)}%</Text>
  </View>
);

const ModelAccuracyPanel: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Model Accuracy</Text>

      {/* Overall accuracy */}
      <View style={s.overallCard}>
        <Text style={s.overallLabel}>Overall Weighted Accuracy</Text>
        <Text style={s.overallValue}>{(data.overall_accuracy * 100).toFixed(1)}%</Text>
        <View style={s.overallBarTrack}>
          <View style={[s.overallBarFill, { width: `${data.overall_accuracy * 100}%` }]} />
        </View>
      </View>

      {/* Per-model bars */}
      {Object.entries(MODEL_LABELS).map(([key, label]) => {
        const model = data.models[key];
        if (!model) return null;
        const isExpanded = expanded === key;

        return (
          <View key={key} style={s.modelBlock}>
            <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : key)} activeOpacity={0.7}>
              <AccuracyBar label={label} value={model.accuracy} color={MODEL_COLORS[key]} />
            </TouchableOpacity>

            {isExpanded && (
              <View style={s.classTable}>
                <View style={s.tableHeader}>
                  <Text style={[s.th, { flex: 2 }]}>Class</Text>
                  <Text style={s.th}>Precision</Text>
                  <Text style={s.th}>Recall</Text>
                  <Text style={s.th}>F1</Text>
                </View>
                {Object.entries(model.per_class).map(([cls, metrics]) => (
                  <View key={cls} style={s.tableRow}>
                    <Text style={[s.td, { flex: 2, color: '#e2e8f0' }]}>{cls}</Text>
                    <Text style={s.td}>{(metrics.precision * 100).toFixed(1)}%</Text>
                    <Text style={s.td}>{(metrics.recall * 100).toFixed(1)}%</Text>
                    <Text style={s.td}>{(metrics.f1 * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <Text style={s.hint}>Tap a model bar to see per-class breakdown</Text>
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
  overallCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overallValue: {
    fontSize: 44,
    fontWeight: '900',
    color: '#22c55e',
    marginVertical: 4,
  },
  overallBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginTop: 8,
  },
  overallBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  modelBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    width: 120,
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#334155',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  barPct: {
    width: 55,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  classTable: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  th: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  td: {
    flex: 1,
    fontSize: 12,
    color: '#94a3b8',
  },
  hint: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ModelAccuracyPanel;
