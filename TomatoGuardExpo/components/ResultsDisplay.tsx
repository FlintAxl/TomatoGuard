import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
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

  // DEBUG: Add this temporarily to see what data you're receiving
  console.log('🔍 ResultsDisplay - Full results:', results);
  console.log('🔍 ResultsDisplay - Analysis exists?', !!results.analysis);

  // Handle backend response format correctly
  let analysis, recommendations, spotDetection;

  // Direct access - the response should have 'analysis' at the root
  if (results.analysis) {
    analysis = results.analysis;
    // Recommendations should be inside analysis from ml_service.py
    recommendations = results.analysis?.recommendations;
    spotDetection = results.analysis?.spot_detection;
    console.log('📊 Using direct analysis path');
    console.log('📊 Recommendations found:', !!recommendations);
  } 
  // Handle batch results array
  else if (Array.isArray(results) && results.length > 0) {
    const firstResult = results[0];
    // Batch results might have analysis nested
    if (firstResult.analysis) {
      analysis = firstResult.analysis;
      recommendations = firstResult.analysis?.recommendations;
      spotDetection = firstResult.analysis?.spot_detection;
      console.log('📊 Using batch results path');
    } else {
      analysis = firstResult;
      recommendations = firstResult?.recommendations;
      spotDetection = firstResult?.spot_detection;
    }
  }
  // Handle nested results.results array (another batch format)
  else if (results.results && Array.isArray(results.results) && results.results.length > 0) {
    const firstResult = results.results[0];
    if (firstResult.analysis) {
      analysis = firstResult.analysis;
      recommendations = firstResult.analysis?.recommendations;
      spotDetection = firstResult.analysis?.spot_detection;
    } else {
      analysis = firstResult;
      recommendations = firstResult?.recommendations;
      spotDetection = firstResult?.spot_detection;
    }
    console.log('📊 Using nested results path');
  }
  // Fallback - assume results is the analysis itself
  else {
    analysis = results;
    recommendations = results.recommendations;
    spotDetection = results.spot_detection;
    console.log('📊 Using fallback path');
  }

  // DEBUG: Check what we extracted
  console.log('🔍 Extracted analysis:', !!analysis);
  console.log('🔍 Extracted recommendations:', !!recommendations);
  console.log('🔍 Extracted spotDetection:', !!spotDetection);

  // Safe extraction with defaults
  const part = analysis?.part_detection?.part || 'Unknown';
  const disease = analysis?.disease_detection?.disease || 'No disease detected';
  const confidence = parseFloat(((analysis?.disease_detection?.confidence || 0) * 100).toFixed(1));
  const partConfidence = parseFloat(((analysis?.part_detection?.confidence || 0) * 100).toFixed(1));

  // DEBUG: Log extracted values
  console.log('📊 Final extracted values:');
  console.log('   Part:', part);
  console.log('   Disease:', disease);
  console.log('   Confidence:', confidence + '%');
  console.log('   Recommendations type:', typeof recommendations);
  console.log('   Recommendations keys:', recommendations ? Object.keys(recommendations) : 'none');

  // Get severity color (THIS IS THE ORIGINAL CODE THAT SHOULD STAY)
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
      <SafeAreaView style={resultsStyles.modalContainer}>
        <TouchableOpacity 
          style={resultsStyles.closeButton}
          onPress={() => setImageViewerVisible(false)}
        >
          <Text style={resultsStyles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        {selectedImage && (
          <Image 
            source={{ uri: selectedImage }} 
            style={resultsStyles.fullScreenImage}
            resizeMode="contain"
          />
        )}
        <Text style={resultsStyles.imageCaption}>
          {selectedImage === spotDetection?.original_image ? 'Original Image' : 'Disease Spots Detection'}
        </Text>
      </SafeAreaView>
    </Modal>
  );

  return (
    <ScrollView style={resultsStyles.container}>
      {/* Status Alert */}
      <View style={[resultsStyles.statusBadge, { backgroundColor: getSeverityBg() }]}>
        <Text style={resultsStyles.statusIcon}>
          {disease.includes('Healthy') ? '✅' : '⚠️'}
        </Text>
        <View style={resultsStyles.statusContent}>
          <Text style={resultsStyles.statusTitle}>
            {disease.includes('Healthy') ? 'Plant Health Status: Healthy' : `Disease Detected: ${disease}`}
          </Text>
          <Text style={resultsStyles.statusText}>
            Analysis Confidence: <Text style={{ fontWeight: '600' }}>{confidence}%</Text>
          </Text>
        </View>
      </View>

      {/* IMAGE COMPARISON SECTION */}
      {spotDetection && !spotDetection.error && (
        <View style={cardStyles.card}>
          <Text style={cardStyles.cardTitle}>Disease Spot Detection</Text>
          <Text style={resultsStyles.sectionDescription}>
            Exact diseased spots identified with bounding boxes
          </Text>
          
          <View style={resultsStyles.imageComparisonContainer}>
            {/* Original Image */}
            <TouchableOpacity 
              style={resultsStyles.imageCard}
              onPress={() => {
                setSelectedImage(spotDetection.original_image);
                setImageViewerVisible(true);
              }}
            >
              <Text style={resultsStyles.imageLabel}>Original Image</Text>
              <Image 
                source={{ uri: spotDetection.original_image }} 
                style={resultsStyles.previewImage}
                resizeMode="cover"
              />
              <Text style={resultsStyles.imageSubLabel}>Tap to view full size</Text>
            </TouchableOpacity>
            
            {/* Annotated Image */}
            <TouchableOpacity 
              style={resultsStyles.imageCard}
              onPress={() => {
                setSelectedImage(spotDetection.annotated_image);
                setImageViewerVisible(true);
              }}
            >
              <Text style={resultsStyles.imageLabel}>Disease Spots Detected</Text>
              <Image 
                source={{ uri: spotDetection.annotated_image }} 
                style={resultsStyles.previewImage}
                resizeMode="cover"
              />
              <Text style={resultsStyles.imageSubLabel}>
                {spotDetection.total_spots} spots detected
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Spot Statistics */}
          <View style={resultsStyles.spotStatsContainer}>
            <View style={resultsStyles.statItem}>
              <Text style={resultsStyles.statValue}>{spotDetection.total_spots}</Text>
              <Text style={resultsStyles.statLabel}>Total Spots</Text>
            </View>
            <View style={resultsStyles.statDivider} />
            <View style={resultsStyles.statItem}>
              <Text style={resultsStyles.statValue}>
                {Math.round(spotDetection.total_area)} px²
              </Text>
              <Text style={resultsStyles.statLabel}>Affected Area</Text>
            </View>
            <View style={resultsStyles.statDivider} />
            <View style={resultsStyles.statItem}>
              <Text style={resultsStyles.statValue}>
                {spotDetection.bounding_boxes?.length > 0 ? 
                 (spotDetection.bounding_boxes[0]?.confidence * 100).toFixed(0) + '%' : 'N/A'}
              </Text>
              <Text style={resultsStyles.statLabel}>Highest Confidence</Text>
            </View>
          </View>
          
          {/* Bounding Box Details */}
          {spotDetection.bounding_boxes && spotDetection.bounding_boxes.length > 0 && (
            <View style={resultsStyles.boundingBoxList}>
              <Text style={resultsStyles.boundingBoxTitle}>Detected Spots Details:</Text>
              {spotDetection.bounding_boxes.slice(0, 5).map((box: any, index: number) => (
                <View key={index} style={resultsStyles.boundingBoxItem}>
                  <Text style={resultsStyles.boundingBoxNumber}>Spot {index + 1}</Text>
                  <View style={resultsStyles.boundingBoxDetails}>
                    <Text style={resultsStyles.boundingBoxText}>
                      Position: ({box.x}, {box.y})
                    </Text>
                    <Text style={resultsStyles.boundingBoxText}>
                      Size: {box.width} × {box.height} px
                    </Text>
                    <Text style={resultsStyles.boundingBoxText}>
                      Area: {Math.round(box.area)} px²
                    </Text>
                    <Text style={resultsStyles.boundingBoxText}>
                      Confidence: {(box.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
              {spotDetection.bounding_boxes.length > 5 && (
                <Text style={resultsStyles.moreSpotsText}>
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
        
        <View style={resultsStyles.infoRow}>
          <Text style={resultsStyles.infoLabel}>Plant Part Identified</Text>
          <Text style={resultsStyles.infoValue}>{getPartIcon()} {part}</Text>
        </View>
        
        <View style={resultsStyles.infoRow}>
          <Text style={resultsStyles.infoLabel}>Part Detection Confidence</Text>
          <Text style={resultsStyles.infoValue}>{partConfidence}%</Text>
        </View>
        
        <View style={resultsStyles.infoRow}>
          <Text style={resultsStyles.infoLabel}>Disease Status</Text>
          <Text style={resultsStyles.infoValue}>{disease}</Text>
        </View>
        
        <View style={[resultsStyles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={resultsStyles.infoLabel}>Disease Confidence</Text>
          <Text style={resultsStyles.infoValue}>{confidence}%</Text>
        </View>

        <View style={resultsStyles.progressBar}>
          <View
            style={[
              resultsStyles.progressFill,
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
              <View style={resultsStyles.bulletList}>
                {recommendations.immediate_actions.map((action: string, idx: number) => (
                  <View key={idx} style={resultsStyles.bulletItem}>
                    <View style={resultsStyles.bulletDot} />
                    <Text style={resultsStyles.bulletText}>{action}</Text>
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
              <View style={resultsStyles.bulletList}>
                {recommendations.organic_options.map((treatment: string, idx: number) => (
                  <View key={idx} style={resultsStyles.bulletItem}>
                    <View style={resultsStyles.bulletDot} />
                    <Text style={resultsStyles.bulletText}>{treatment}</Text>
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
              <View style={resultsStyles.bulletList}>
                {recommendations.preventive_measures.map((prevention: string, idx: number) => (
                  <View key={idx} style={resultsStyles.bulletItem}>
                    <View style={resultsStyles.bulletDot} />
                    <Text style={resultsStyles.bulletText}>{prevention}</Text>
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

export default ResultsDisplay;