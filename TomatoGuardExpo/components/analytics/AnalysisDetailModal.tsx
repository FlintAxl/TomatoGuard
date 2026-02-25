import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAnalysisDetail, AnalysisDetail } from '../../services/api/analyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  analysisId: string | null;
  visible: boolean;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<Props> = ({ analysisId, visible, onClose }) => {
  const { authState } = useAuth();
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<'original' | 'annotated'>('annotated');

  useEffect(() => {
    if (visible && analysisId) {
      loadDetail();
    }
    return () => {
      setDetail(null);
      setLoading(true);
      setError(null);
      setActiveImage('annotated');
    };
  }, [visible, analysisId]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAnalysisDetail(authState.accessToken || undefined, analysisId!);
      setDetail(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load analysis detail');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
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

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return '#22c55e';
    if (conf >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={s.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={s.loadingText}>Loading analysis details...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={s.centerContainer}>
          <Text style={s.errorIcon}>⚠️</Text>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={loadDetail}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!detail) return null;

    const isHealthy = detail.disease === 'Healthy';
    const confColor = getConfidenceColor(detail.confidence);
    const hasAnnotated = !!detail.annotated_image;
    const hasOriginalB64 = !!detail.original_image;

    // Auto-select best available image tab
    const effectiveTab = (activeImage === 'annotated' && !hasAnnotated) ? 'original' : activeImage;

    // Determine which image to show
    let imageSource: { uri: string } | null = null;
    if (effectiveTab === 'annotated' && hasAnnotated) {
      // Base64 string may already contain the data URI prefix
      const annotated = detail.annotated_image!;
      imageSource = { uri: annotated.startsWith('data:') ? annotated : `data:image/jpeg;base64,${annotated}` };
    } else if (hasOriginalB64) {
      const original = detail.original_image!;
      imageSource = { uri: original.startsWith('data:') ? original : `data:image/jpeg;base64,${original}` };
    } else if (detail.image_url) {
      imageSource = { uri: detail.image_url };
    }

    return (
      <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
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
          {(hasAnnotated || hasOriginalB64 || detail.image_url) && (
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

        {/* Disease & Part Detection - Combined Row */}
        <View style={s.splitCard}>
          {/* Disease Detection */}
          <View style={s.halfCard}>
            <Text style={s.cardLabel}>Disease</Text>
            <View style={s.diseaseRow}>
              <View style={[s.statusDot, { backgroundColor: isHealthy ? '#22c55e' : '#ef4444' }]} />
              <Text style={s.diseaseCompact}>{detail.disease}</Text>
            </View>
            <View style={s.confBar}>
              <View style={[s.confFill, { width: `${detail.confidence * 100}%`, backgroundColor: confColor }]} />
            </View>
            <Text style={[s.confText, { color: confColor }]}>
              {(detail.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          {/* Part Detection */}
          <View style={s.halfCard}>
            <Text style={s.cardLabel}>Plant Part</Text>
            <View style={s.partRowCompact}>
              <Text style={s.partIconSmall}>
                {detail.plant_part === 'fruit' ? '🍅' : detail.plant_part === 'leaf' ? '🍃' : '🌿'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={s.partValueCompact}>
                  {detail.plant_part
                    ? detail.plant_part.charAt(0).toUpperCase() + detail.plant_part.slice(1)
                    : 'Unknown'}
                </Text>
                <Text style={s.partConfCompact}>
                  {(detail.part_confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alternative Predictions */}
        {detail.alternative_predictions && detail.alternative_predictions.length > 0 && (
          <View style={s.compactCard}>
            <Text style={s.cardLabel}>Alternative Predictions</Text>
            {detail.alternative_predictions.slice(0, 3).map((alt, i) => (
              <View key={i} style={s.altRowCompact}>
                <Text style={s.altDiseaseCompact}>{alt.disease}</Text>
                <Text style={[s.altConfCompact, { color: getConfidenceColor(alt.confidence) }]}>
                  {(alt.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Spot Detection & Analysis Info */}
        <View style={s.splitCard}>
          {/* Spot Detection */}
          {detail.total_spots > 0 ? (
            <View style={s.halfCard}>
              <Text style={s.cardLabel}>Spot Detection</Text>
              <View style={s.spotRowCompact}>
                <View style={s.spotStatCompact}>
                  <Text style={s.spotNumberCompact}>{detail.total_spots}</Text>
                  <Text style={s.spotLabelCompact}>Spots</Text>
                </View>
                <View style={s.spotStatCompact}>
                  <Text style={s.spotNumberCompact}>{detail.bounding_boxes.length}</Text>
                  <Text style={s.spotLabelCompact}>Boxes</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={s.halfCard}>
              <Text style={s.cardLabel}>Analysis Date</Text>
              <Text style={s.dateValueCompact}>
                {detail.created_at ? formatDate(detail.created_at) : 'N/A'}
              </Text>
            </View>
          )}

          {/* Analysis ID */}
          <View style={s.halfCard}>
            <Text style={s.cardLabel}>Analysis ID</Text>
            <Text style={s.idValueCompact}>{detail.id.slice(-8)}</Text>
            <Text style={s.dateValueCompact}>
              {detail.created_at ? formatDate(detail.created_at) : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Treatment Recommendations */}
        {detail.recommendations && !isHealthy && (
          <View style={s.recoCard}>
            <Text style={s.cardLabel}>💊 Treatment Recommendations</Text>

            {detail.recommendations.description && (
              <Text style={s.recoDescription}>{detail.recommendations.description}</Text>
            )}

            {(detail.recommendations.immediate_actions?.length ?? 0) > 0 && (
              <View style={s.recoBlock}>
                <Text style={s.recoBlockTitle}>🚨 Immediate Actions</Text>
                {detail.recommendations.immediate_actions!.map((item: string, i: number) => (
                  <View key={i} style={s.recoBulletRow}>
                    <Text style={s.recoBullet}>•</Text>
                    <Text style={s.recoBulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {(detail.recommendations.preventive_measures?.length ?? 0) > 0 && (
              <View style={s.recoBlock}>
                <Text style={s.recoBlockTitle}>🛡️ Prevention</Text>
                {detail.recommendations.preventive_measures!.map((item: string, i: number) => (
                  <View key={i} style={s.recoBulletRow}>
                    <Text style={s.recoBullet}>•</Text>
                    <Text style={s.recoBulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {(detail.recommendations.organic_options?.length ?? 0) > 0 && (
              <View style={s.recoBlock}>
                <Text style={s.recoBlockTitle}>🌿 Organic Options</Text>
                {detail.recommendations.organic_options!.map((item: string, i: number) => (
                  <View key={i} style={s.recoBulletRow}>
                    <Text style={s.recoBullet}>•</Text>
                    <Text style={s.recoBulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {detail.recommendations.confidence?.note && (
              <View style={s.recoNoteBox}>
                <Text style={s.recoNoteText}>📝 {detail.recommendations.confidence.note}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Analysis Detail</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '55%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: '#f87171',
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
    fontWeight: '700',
    fontSize: 14,
  },

  // Image Section
  imageSection: {
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.45,
    borderRadius: 10,
    backgroundColor: '#1e293b',
  },
  noImagePlaceholder: {
    width: '100%',
    height: SCREEN_WIDTH * 0.35,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noImageLabel: {
    fontSize: 14,
    color: '#475569',
  },
  imageToggle: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  imgTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  imgTabActive: {
    backgroundColor: '#3b82f6',
  },
  imgTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  imgTabTextActive: {
    color: '#ffffff',
  },

  // Detail Cards
  detailCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  compactCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  splitCard: {
    flexDirection: 'row',
    gap: 8,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  diseaseValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  // Compact styles
  diseaseCompact: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  confBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  confFill: {
    height: '100%',
    borderRadius: 3,
  },
  confText: {
    fontSize: 13,
    fontWeight: '700',
  },
  altSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  altLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  altDisease: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  altConf: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Compact alternative styles
  altRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  altDiseaseCompact: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  altConfCompact: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Part Detection
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partIcon: {
    fontSize: 32,
  },
  partValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  partConf: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  // Compact part styles
  partRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partIconSmall: {
    fontSize: 24,
  },
  partValueCompact: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
  },
  partConfCompact: {
    fontSize: 11,
    color: '#94a3b8',
  },

  // Spot Detection
  spotRow: {
    flexDirection: 'row',
    gap: 16,
  },
  spotStat: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  spotNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  spotLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Compact spot styles
  spotRowCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  spotStatCompact: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  spotNumberCompact: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  spotLabelCompact: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },

  // Date
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e2e8f0',
    lineHeight: 22,
  },
  // Compact date and ID styles
  dateValueCompact: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
    lineHeight: 18,
  },
  idValueCompact: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginBottom: 4,
  },

  // ID
  idCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  idValue: {
    fontSize: 11,
    color: '#475569',
    fontFamily: 'monospace',
  },
  // Recommendation styles
  recoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  recoDescription: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  recoBlock: {
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  recoBlockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
  },
  recoBulletRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingRight: 8,
  },
  recoBullet: {
    color: '#6366f1',
    fontSize: 13,
    marginRight: 8,
    marginTop: 1,
  },
  recoBulletText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  recoNoteBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  recoNoteText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
  },
});

export default AnalysisDetailModal;
