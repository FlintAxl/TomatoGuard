import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchUserAnalysisHistory,
  fetchUserAnalysisDetail,
  deleteUserAnalysis,
  UserAnalysisHistoryItem,
  UserAnalysisDetail,
} from '../services/api/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const UserAnalysisHistory: React.FC<Props> = ({ visible, onClose }) => {
  const { authState } = useAuth();
  const [analyses, setAnalyses] = useState<UserAnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Detail modal state
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detail, setDetail] = useState<UserAnalysisDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<'original' | 'annotated'>('annotated');

  const LIMIT = 20;

  const loadAnalyses = useCallback(
    async (newOffset = 0, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const data = await fetchUserAnalysisHistory(
          authState.accessToken || undefined,
          LIMIT,
          newOffset
        );
        
        if (append) {
          setAnalyses((prev) => [...prev, ...data]);
        } else {
          setAnalyses(data);
        }
        
        setOffset(newOffset + data.length);
        setHasMore(data.length === LIMIT);
      } catch (err) {
        console.error('Failed to load user analysis history:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authState.accessToken]
  );

  useEffect(() => {
    if (visible) {
      loadAnalyses(0, false);
    }
    return () => {
      setAnalyses([]);
      setOffset(0);
      setHasMore(true);
      setLoading(true);
    };
  }, [visible, loadAnalyses]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadAnalyses(offset, true);
    }
  };

  const handleDelete = (id: string, disease: string) => {
    const doDelete = async () => {
      try {
        await deleteUserAnalysis(authState.accessToken || undefined, id);
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to delete analysis:', err);
        if (Platform.OS === 'web') {
          window.alert('Failed to delete analysis. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete analysis. Please try again.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete this "${disease}" analysis?`);
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Analysis',
        `Are you sure you want to delete this "${disease}" analysis?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: doDelete,
          },
        ]
      );
    }
  };

  const handleSelectAnalysis = async (id: string) => {
    setSelectedAnalysisId(id);
    setDetailModalVisible(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    setActiveImage('annotated');

    try {
      const data = await fetchUserAnalysisDetail(authState.accessToken || undefined, id);
      setDetail(data);
    } catch (err: any) {
      setDetailError(err?.message || 'Failed to load analysis detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedAnalysisId(null);
    setDetail(null);
    setDetailError(null);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return '#22c55e';
    if (conf >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateLong = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Extract analysis data from the nested structure
  const getAnalysisData = (detail: UserAnalysisDetail) => {
    const analysisResult = detail.analysis_result;
    const nested = analysisResult?.analysis;
    
    return {
      disease: nested?.disease_detection?.disease || analysisResult?.disease_detection?.disease || 'Unknown',
      confidence: nested?.disease_detection?.confidence || analysisResult?.disease_detection?.confidence || 0,
      alternativePredictions: nested?.disease_detection?.alternative_predictions || analysisResult?.disease_detection?.alternative_predictions || [],
      part: nested?.part_detection?.part || analysisResult?.part_detection?.part || 'unknown',
      partConfidence: nested?.part_detection?.confidence || analysisResult?.part_detection?.confidence || 0,
      alternativeParts: nested?.part_detection?.alternative_parts || analysisResult?.part_detection?.alternative_parts || [],
      totalSpots: nested?.spot_detection?.total_spots || analysisResult?.spot_detection?.total_spots || 0,
      boundingBoxes: nested?.spot_detection?.bounding_boxes || analysisResult?.spot_detection?.bounding_boxes || [],
      annotatedImage: nested?.spot_detection?.annotated_image || analysisResult?.spot_detection?.annotated_image || null,
    };
  };

  const renderDetailModal = () => {
    return (
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={s.detailModalOverlay}>
          <View style={s.detailModalContainer}>
            {/* Header */}
            <View style={s.detailModalHeader}>
              <Text style={s.detailModalTitle}>Analysis Detail</Text>
              <TouchableOpacity onPress={closeDetailModal} style={s.detailCloseBtn}>
                <Text style={s.detailCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View style={s.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={s.loadingText}>Loading analysis details...</Text>
              </View>
            ) : detailError ? (
              <View style={s.centerContainer}>
                <Text style={s.errorIcon}>⚠️</Text>
                <Text style={s.errorText}>{detailError}</Text>
                <TouchableOpacity
                  style={s.retryBtn}
                  onPress={() => selectedAnalysisId && handleSelectAnalysis(selectedAnalysisId)}
                >
                  <Text style={s.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : detail ? (
              <ScrollView style={s.detailScrollContent} showsVerticalScrollIndicator={false}>
                {(() => {
                  const data = getAnalysisData(detail);
                  const isHealthy = data.disease === 'Healthy';
                  const confColor = getConfidenceColor(data.confidence);
                  const hasAnnotated = !!data.annotatedImage;
                  const effectiveTab = (activeImage === 'annotated' && !hasAnnotated) ? 'original' : activeImage;

                  let imageSource: { uri: string } | null = null;
                  if (effectiveTab === 'annotated' && hasAnnotated) {
                    const annotated = data.annotatedImage!;
                    imageSource = { uri: annotated.startsWith('data:') ? annotated : `data:image/jpeg;base64,${annotated}` };
                  } else if (detail.image_url) {
                    imageSource = { uri: detail.image_url };
                  }

                  return (
                    <>
                      {/* Image Section */}
                      <View style={s.imageSection}>
                        {imageSource ? (
                          <Image source={imageSource} style={s.mainImage} resizeMode="contain" />
                        ) : (
                          <View style={s.noImagePlaceholder}>
                            <Text style={s.noImageIcon}>🍅</Text>
                            <Text style={s.noImageLabel}>No image available</Text>
                          </View>
                        )}

                        {/* Image toggle tabs */}
                        {(hasAnnotated || detail.image_url) && (
                          <View style={s.imageToggle}>
                            {hasAnnotated && (
                              <TouchableOpacity
                                style={[s.imgTab, effectiveTab === 'annotated' && s.imgTabActive]}
                                onPress={() => setActiveImage('annotated')}
                              >
                                <Text style={[s.imgTabText, effectiveTab === 'annotated' && s.imgTabTextActive]}>
                                  🔍 Scanned
                                </Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={[s.imgTab, effectiveTab === 'original' && s.imgTabActive]}
                              onPress={() => setActiveImage('original')}
                            >
                              <Text style={[s.imgTabText, effectiveTab === 'original' && s.imgTabTextActive]}>
                                📷 Original
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      {/* Disease Detection */}
                      <View style={s.detailSection}>
                        <Text style={s.detailSectionTitle}>🔬 Disease Detection</Text>
                        <View style={s.detailCard}>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Disease</Text>
                            <Text style={[s.detailValue, { color: isHealthy ? '#22c55e' : '#f8fafc' }]}>
                              {data.disease}
                            </Text>
                          </View>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Confidence</Text>
                            <Text style={[s.detailValue, { color: confColor }]}>
                              {(data.confidence * 100).toFixed(2)}%
                            </Text>
                          </View>
                        </View>

                        {/* Alternative predictions */}
                        {data.alternativePredictions.length > 0 && (
                          <View style={s.altSection}>
                            <Text style={s.altTitle}>Alternative Predictions</Text>
                            {data.alternativePredictions.slice(0, 3).map((alt, idx) => (
                              <View key={idx} style={s.altRow}>
                                <Text style={s.altDisease}>{alt.disease}</Text>
                                <Text style={s.altConf}>{(alt.confidence * 100).toFixed(1)}%</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Part Detection */}
                      <View style={s.detailSection}>
                        <Text style={s.detailSectionTitle}>🌱 Plant Part</Text>
                        <View style={s.detailCard}>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Detected Part</Text>
                            <Text style={s.detailValue}>
                              {data.part.charAt(0).toUpperCase() + data.part.slice(1)}
                            </Text>
                          </View>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Confidence</Text>
                            <Text style={[s.detailValue, { color: getConfidenceColor(data.partConfidence) }]}>
                              {(data.partConfidence * 100).toFixed(2)}%
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Spot Detection */}
                      {data.totalSpots > 0 && (
                        <View style={s.detailSection}>
                          <Text style={s.detailSectionTitle}>🎯 Spot Detection</Text>
                          <View style={s.detailCard}>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Total Spots</Text>
                              <Text style={s.detailValue}>{data.totalSpots}</Text>
                            </View>
                            <View style={s.detailRow}>
                              <Text style={s.detailLabel}>Bounding Boxes</Text>
                              <Text style={s.detailValue}>{data.boundingBoxes.length}</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {/* Metadata */}
                      <View style={s.detailSection}>
                        <Text style={s.detailSectionTitle}>📅 Analysis Info</Text>
                        <View style={s.detailCard}>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Date</Text>
                            <Text style={s.detailValueSmall}>{formatDateLong(detail.created_at)}</Text>
                          </View>
                          <View style={s.detailRow}>
                            <Text style={s.detailLabel}>Analysis ID</Text>
                            <Text style={s.detailValueSmall}>{detail.id}</Text>
                          </View>
                        </View>
                      </View>
                    </>
                  );
                })()}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={s.loadingText}>Loading your analysis history...</Text>
        </View>
      );
    }

    if (analyses.length === 0) {
      return (
        <View style={s.emptyCard}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>No analyses recorded yet</Text>
          <Text style={s.emptySubtext}>Your analysis history will appear here</Text>
        </View>
      );
    }

    return (
      <>
        <View style={s.headerRow}>
          <Text style={s.sectionTitle}>Your Analysis History</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{analyses.length} analyses</Text>
          </View>
        </View>
        <Text style={s.subTitle}>Tap to view details — Swipe to delete</Text>

        <ScrollView style={s.listContainer} showsVerticalScrollIndicator={false}>
          {analyses.map((item, idx) => {
            const isHealthy = item.disease === 'Healthy';
            const confPercent = (item.confidence * 100).toFixed(1);
            const confColor = getConfidenceColor(item.confidence);

            return (
              <TouchableOpacity
                key={item.id || idx}
                style={s.itemCard}
                activeOpacity={0.7}
                onPress={() => handleSelectAnalysis(item.id)}
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
                    <Text style={[s.metaConf, { color: confColor }]}>
                      {confPercent}%
                    </Text>
                  </View>

                  <Text style={s.date}>{formatDate(item.created_at)}</Text>
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
          {hasMore && (
            <TouchableOpacity
              style={s.loadMoreBtn}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#f8fafc" />
              ) : (
                <Text style={s.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>📊 My Analysis History</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={s.contentContainer}>
            {renderContent()}
          </View>
        </View>
      </View>

      {/* Detail Modal */}
      {renderDetailModal()}
    </Modal>
  );
};

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH * 0.95, 500),
    maxHeight: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
    maxHeight: '85%',
  },
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
    fontSize: 16,
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
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  listContainer: {
    maxHeight: 400,
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
  // Detail modal styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContainer: {
    width: Math.min(SCREEN_WIDTH * 0.95, 500),
    maxHeight: '95%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  detailCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCloseBtnText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  detailScrollContent: {
    padding: 16,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  noImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noImageLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  imageToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  imgTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  imgTabActive: {
    backgroundColor: '#6366f1',
  },
  imgTabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  imgTabTextActive: {
    color: '#fff',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  detailCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValueSmall: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  altSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  altTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '600',
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  altDisease: {
    color: '#94a3b8',
    fontSize: 12,
  },
  altConf: {
    color: '#64748b',
    fontSize: 12,
  },
});

export default UserAnalysisHistory;
