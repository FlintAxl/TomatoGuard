import { View, Text, ScrollView } from 'react-native';
import { resultsStyles, cardStyles } from '../styles';

interface ResultsDisplayProps {
  results: any;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  console.log("Results data:", results);
  
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
  let analysis, recommendations;
  
  if (Array.isArray(results)) {
    const firstResult = results[0];
    analysis = firstResult?.analysis || firstResult;
    recommendations = analysis?.recommendations || firstResult?.recommendations;
  } else if (results.results && Array.isArray(results.results)) {
    const firstResult = results.results[0];
    analysis = firstResult?.analysis || firstResult;
    recommendations = analysis?.recommendations || firstResult?.recommendations;
  } else if (results.analysis) {
    analysis = results.analysis;
    recommendations = results.recommendations || analysis?.recommendations;
  } else {
    analysis = results;
    recommendations = results.recommendations;
  }

  console.log("Extracted analysis:", analysis);
  console.log("Extracted recommendations:", recommendations);

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

      {/* Raw Data for Debugging (Collapsible in production) */}
      <View style={[cardStyles.card, { backgroundColor: '#f8fafc' }]}>
        <Text style={[cardStyles.cardTitle, { fontSize: 14, color: '#64748b' }]}>
          Technical Data (Debug)
        </Text>
        <ScrollView horizontal style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
            {JSON.stringify(results, null, 2)}
          </Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = resultsStyles;

export default ResultsDisplay;