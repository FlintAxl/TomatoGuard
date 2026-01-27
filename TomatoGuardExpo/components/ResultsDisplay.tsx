import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
import { resultsStyles, cardStyles } from '../styles';

interface ResultsDisplayProps {
  results: any;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  
  if (!results) {
    return (
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>No Analysis Results</Text>
        <Text style={cardStyles.cardDescription}>
          No analysis has been performed yet. Please capture or upload images to begin the disease detection process.
        </Text>
      </View>
    );
  }

  // Handle backend response format
  let analysis, recommendations, spotDetection;
  
  if (Array.isArray(results)) {
    const firstResult = results[0];
    analysis = firstResult?.analysis || firstResult;
    recommendations = analysis?.recommendations || firstResult?.recommendations;
    spotDetection = analysis?.spot_detection || firstResult?.spot_detection;
  } else if (results.results && Array.isArray(results.results)) {
    const firstResult = results.results[0];
    analysis = firstResult?.analysis || firstResult;
    recommendations = analysis?.recommendations || firstResult?.recommendations;
    spotDetection = analysis?.spot_detection || firstResult?.spot_detection;
  } else if (results.analysis) {
    analysis = results.analysis;
    recommendations = results.recommendations || analysis?.recommendations;
    spotDetection = results.spot_detection || analysis?.spot_detection;
  } else {
    analysis = results;
    recommendations = results.recommendations;
    spotDetection = results.spot_detection;
  }

  // Safe extraction with defaults
  const part = analysis?.part_detection?.part || 'Unknown';
  const disease = analysis?.disease_detection?.disease || 'No disease detected';
  const confidence = parseFloat(((analysis?.disease_detection?.confidence || 0) * 100).toFixed(1));
  const partConfidence = parseFloat(((analysis?.part_detection?.confidence || 0) * 100).toFixed(1));

  // Get severity color
  const getSeverityColor = () => {
    if (disease === 'Healthy' || disease.includes('Healthy')) return '#10b981';
    if (confidence > 80) return '#ef4444';
    if (confidence > 60) return '#f59e0b';
    return '#3b82f6';
  };

  const getSeverityBg = () => {
    if (disease === 'Healthy' || disease.includes('Healthy')) return '#d1fae5';
    if (confidence > 80) return '#fee2e2';
    if (confidence > 60) return '#fed7aa';
    return '#dbeafe';
  };

  const getPartIcon = () => {
    switch (part?.toLowerCase()) {
      case 'leaf': return '🍃';
      case 'fruit': return '🍅';
      case 'stem': return '🌿';
      default: return '🌱';
    }
  };

  // Image Viewer Modal
  const ImageViewer = () => (
    <Modal
      visible={imageViewerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImageViewerVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setImageViewerVisible(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        )}
        <Text style={styles.imageCaption}>
          {selectedImage === spotDetection?.original_image ? 'Original Image' : 'Disease Spots Detection'}
        </Text>
      </SafeAreaView>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Status Alert */}
      <View style={[styles.statusBadge, { backgroundColor: getSeverityBg() }]}>
        <Text style={styles.statusIcon}>
          {disease.includes('Healthy') ? '✅' : '⚠️'}
        </Text>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {disease.includes('Healthy') ? 'Plant Health Status: Healthy' : `Disease Detected: ${disease}`}
          </Text>
          <Text style={styles.statusText}>
            Analysis Confidence: <Text style={{ fontWeight: '600' }}>{confidence}%</Text>
          </Text>
        </View>
      </View>

      {/* IMAGE COMPARISON SECTION - NEW */}
      {spotDetection && !spotDetection.error && (
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Disease Spot Detection</Text>
          <Text style={styles.sectionDescription}>
            Exact diseased spots identified with bounding boxes
          </Text>
          
          <View style={styles.imageComparisonContainer}>
            {/* Original Image */}
            <TouchableOpacity 
              style={styles.imageCard}
              onPress={() => {
                setSelectedImage(spotDetection.original_image);
                setImageViewerVisible(true);
              }}
            >
              <Text style={styles.imageLabel}>Original Image</Text>
              <Image 
                source={{ uri: spotDetection.original_image }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Text style={styles.imageSubLabel}>Tap to view full size</Text>
            </TouchableOpacity>
            
            {/* Annotated Image */}
            <TouchableOpacity 
              style={styles.imageCard}
              onPress={() => {
                setSelectedImage(spotDetection.annotated_image);
                setImageViewerVisible(true);
              }}
            >
              <Text style={styles.imageLabel}>Disease Spots Detected</Text>
              <Image 
                source={{ uri: spotDetection.annotated_image }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Text style={styles.imageSubLabel}>
                {spotDetection.total_spots} spots detected
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Spot Statistics */}
          <View style={styles.spotStatsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{spotDetection.total_spots}</Text>
              <Text style={styles.statLabel}>Total Spots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(spotDetection.total_area)} px²
              </Text>
              <Text style={styles.statLabel}>Affected Area</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {spotDetection.bounding_boxes?.length > 0 ? 
                 (spotDetection.bounding_boxes[0]?.confidence * 100).toFixed(0) + '%' : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Highest Confidence</Text>
            </View>
          </View>
          
          {/* Bounding Box Details */}
          {spotDetection.bounding_boxes && spotDetection.bounding_boxes.length > 0 && (
            <View style={styles.boundingBoxList}>
              <Text style={styles.boundingBoxTitle}>Detected Spots Details:</Text>
              {spotDetection.bounding_boxes.slice(0, 5).map((box: any, index: number) => (
                <View key={index} style={styles.boundingBoxItem}>
                  <Text style={styles.boundingBoxNumber}>Spot {index + 1}</Text>
                  <View style={styles.boundingBoxDetails}>
                    <Text style={styles.boundingBoxText}>
                      Position: ({box.x}, {box.y})
                    </Text>
                    <Text style={styles.boundingBoxText}>
                      Size: {box.width} × {box.height} px
                    </Text>
                    <Text style={styles.boundingBoxText}>
                      Area: {Math.round(box.area)} px²
                    </Text>
                    <Text style={styles.boundingBoxText}>
                      Confidence: {(box.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
              {spotDetection.bounding_boxes.length > 5 && (
                <Text style={styles.moreSpotsText}>
                  ...and {spotDetection.bounding_boxes.length - 5} more spots
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Detection Summary Card */}
      <View style={cardStyles.card}>
        <Text style={cardStyles.cardTitle}>Detection Summary</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plant Part Identified</Text>
          <Text style={styles.infoValue}>{getPartIcon()} {part}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Part Detection Confidence</Text>
          <Text style={styles.infoValue}>{partConfidence}%</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disease Status</Text>
          <Text style={styles.infoValue}>{disease}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Disease Confidence</Text>
          <Text style={styles.infoValue}>{confidence}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${confidence}%`,
                backgroundColor: getSeverityColor()
              }
            ]}
          />
        </View>
      </View>

      {/* Recommendations Card */}
      {recommendations && (
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Treatment Recommendations</Text>
          
          {recommendations.description && (
            <Text style={cardStyles.cardDescription}>
              {recommendations.description}
            </Text>
          )}

          {recommendations.immediate_actions && recommendations.immediate_actions.length > 0 && (
            <>
              <Text style={[cardStyles.cardTitle, { fontSize: 16, marginTop: 16, marginBottom: 8 }]}>
                🚨 Immediate Actions Required
              </Text>
              <View style={styles.bulletList}>
                {recommendations.immediate_actions.map((action: string, idx: number) => (
                  <View key={idx} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{action}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {recommendations.organic_options && recommendations.organic_options.length > 0 && (
            <>
              <Text style={[cardStyles.cardTitle, { fontSize: 16, marginTop: 16, marginBottom: 8 }]}>
                🌿 Organic Treatment Options
              </Text>
              <View style={styles.bulletList}>
                {recommendations.organic_options.map((treatment: string, idx: number) => (
                  <View key={idx} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{treatment}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {recommendations.preventive_measures && recommendations.preventive_measures.length > 0 && (
            <>
              <Text style={[cardStyles.cardTitle, { fontSize: 16, marginTop: 16, marginBottom: 8 }]}>
                🛡️ Preventive Measures
              </Text>
              <View style={styles.bulletList}>
                {recommendations.preventive_measures.map((prevention: string, idx: number) => (
                  <View key={idx} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{prevention}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {recommendations.confidence?.note && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <Text style={[cardStyles.cardDescription, { marginBottom: 0, fontStyle: 'italic' }]}>
                📝 Note: {recommendations.confidence.note}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Professional Disclaimer */}
      <View style={[cardStyles.card, { backgroundColor: '#fef3c7' }]}>
        <Text style={[cardStyles.cardTitle, { color: '#92400e' }]}>⚠️ Professional Consultation</Text>
        <Text style={[cardStyles.cardDescription, { color: '#78350f', marginBottom: 0 }]}>
          This analysis is provided for informational purposes only. For severe infections or commercial operations, please consult with a certified agricultural specialist or plant pathologist.
        </Text>
      </View>

      {/* Image Viewer Modal */}
      <ImageViewer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#4b5563',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  // NEW STYLES FOR BOUNDING BOX SECTION
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  imageComparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageSubLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  spotStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  boundingBoxList: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  boundingBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  boundingBoxItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  boundingBoxNumber: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  boundingBoxDetails: {
    flex: 1,
  },
  boundingBoxText: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 2,
  },
  moreSpotsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageCaption: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ResultsDisplay;