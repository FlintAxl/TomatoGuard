import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAnalysisHistory,
  deleteAnalysis,
  AnalysisHistoryItem,
} from '../../services/api/analyticsService';

interface Props {
  onSelectAnalysis: (id: string) => void;
}

const AnalysisHistory: React.FC<Props> = ({ onSelectAnalysis }) => {
  const { authState } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(
    async (p: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const data = await fetchAnalysisHistory(authState.accessToken || undefined, p, 20);
        setAnalyses((prev) => (append ? [...prev, ...data.analyses] : data.analyses));
        setPage(data.page);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load analysis history:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authState.accessToken]
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadPage(page + 1, true);
    }
  };

  const handleDelete = (id: string, disease: string) => {
    Alert.alert(
      'Delete Analysis',
      `Are you sure you want to delete this "${disease}" analysis?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAnalysis(authState.accessToken || undefined, id);
              // Remove from local state
              setAnalyses((prev) => prev.filter((a) => a.id !== id));
              setTotal((prev) => prev - 1);
            } catch (err) {
              console.error('Failed to delete analysis:', err);
              Alert.alert('Error', 'Failed to delete analysis. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={s.loadingText}>Loading analysis history...</Text>
      </View>
    );
  }

  if (analyses.length === 0) {
    return (
      <View style={s.container}>
        <Text style={s.sectionTitle}>Analysis History</Text>
        <View style={s.emptyCard}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>No analyses recorded yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>Analysis History</Text>
        <View style={s.badge}>
          <Text style={s.badgeText}>{total} total</Text>
        </View>
      </View>
      <Text style={s.subTitle}>
        Showing {analyses.length} of {total} analyses — Tap to view details
      </Text>

      {analyses.map((item, idx) => {
        const isHealthy = item.disease === 'Healthy';
        const confPercent = (item.confidence * 100).toFixed(1);
        const confColor =
          item.confidence >= 0.9
            ? '#22c55e'
            : item.confidence >= 0.7
            ? '#f59e0b'
            : '#ef4444';

        const dateStr = new Date(item.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <TouchableOpacity
            key={item.id || idx}
            style={s.itemCard}
            activeOpacity={0.7}
            onPress={() => onSelectAnalysis(item.id)}
          >
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
                <View style={s.partBadge}>
                  <Text style={s.partBadgeText}>
                    {item.plant_part
                      ? item.plant_part.charAt(0).toUpperCase() + item.plant_part.slice(1)
                      : '—'}
                  </Text>
                </View>
                <Text style={[s.metaConf, { color: confColor }]}>
                  {confPercent}%
                </Text>
              </View>

              <Text style={s.date}>{dateStr}</Text>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() => handleDelete(item.id, item.disease || 'Unknown')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>

            {/* Chevron */}
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      {/* Load more */}
      {page < totalPages && (
        <TouchableOpacity
          style={s.loadMoreBtn}
          onPress={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#f8fafc" />
          ) : (
            <Text style={s.loadMoreText}>
              Load More ({analyses.length} / {total})
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { marginBottom: 32 },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
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
    width: 52,
    height: 52,
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
    marginTop: 4,
    gap: 8,
  },
  partBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partBadgeText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  metaConf: {
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    fontSize: 10,
    color: '#475569',
    marginTop: 3,
  },
  chevron: {
    fontSize: 24,
    color: '#475569',
    fontWeight: '300',
    marginLeft: 8,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  loadMoreBtn: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  loadMoreText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AnalysisHistory;
