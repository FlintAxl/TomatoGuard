import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface AnalysisItem {
  id: string;
  user_id: string;
  image_url: string;
  disease: string;
  confidence: number;
  plant_part: string;
  severity: string | null;
  created_at: string;
}

interface Props {
  data: AnalysisItem[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#22c55e',
  Moderate: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444',
};

const RecentAnalysesFeed: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={s.container}>
        <Text style={s.sectionTitle}>Recent Analyses</Text>
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>No analyses recorded yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Recent Analyses</Text>
      <Text style={s.subTitle}>Last {data.length} analyses across all users</Text>

      {data.map((item, idx) => {
        const isHealthy = item.disease === 'Healthy';
        const confColor =
          item.confidence >= 0.9 ? '#22c55e' : item.confidence >= 0.7 ? '#f59e0b' : '#ef4444';
        const sevColor = SEVERITY_COLORS[item.severity || ''] || '#475569';

        const dateStr = new Date(item.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <View key={item.id || idx} style={s.itemCard}>
            {/* Thumbnail */}
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={s.thumbnail} />
            ) : (
              <View style={[s.thumbnail, s.noImage]}>
                <Text style={s.noImageText}>🍅</Text>
              </View>
            )}

            {/* Info */}
            <View style={s.info}>
              <Text
                style={[s.disease, { color: isHealthy ? '#22c55e' : '#f8fafc' }]}
                numberOfLines={1}
              >
                {item.disease || 'Unknown'}
              </Text>

              <View style={s.metaRow}>
                <Text style={s.metaPart}>
                  {item.plant_part ? item.plant_part.charAt(0).toUpperCase() + item.plant_part.slice(1) : '—'}
                </Text>
                <Text style={[s.metaConf, { color: confColor }]}>
                  {(item.confidence * 100).toFixed(1)}%
                </Text>
                {item.severity && (
                  <View style={[s.sevBadge, { backgroundColor: sevColor + '22', borderColor: sevColor }]}>
                    <Text style={[s.sevText, { color: sevColor }]}>{item.severity}</Text>
                  </View>
                )}
              </View>

              <Text style={s.date}>{dateStr}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 32 },
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
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#334155',
    marginRight: 12,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  disease: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 8,
  },
  metaPart: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  metaConf: {
    fontSize: 12,
    fontWeight: '700',
  },
  sevBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '600',
  },
  date: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
});

export default RecentAnalysesFeed;
