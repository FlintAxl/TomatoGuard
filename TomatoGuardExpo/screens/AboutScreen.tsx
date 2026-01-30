import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { appStyles } from '../styles';

const AboutScreen = () => {
  const styles = appStyles;
  
  return (
    <ScrollView style={styles.contentArea}>
      <View style={styles.contentPadding}>
        <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>TomatoGuard System</Text>
          <Text style={styles.text}>
            TomatoGuard is an advanced AI-powered diagnostic system designed for the detection and analysis of diseases in tomato plants. Utilizing state-of-the-art MobileNetV2 deep learning models, the system provides accurate identification across multiple plant parts.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supported Plant Parts</Text>
            <Text style={styles.bulletText}>• Leaves: 6 disease classifications + healthy state</Text>
            <Text style={styles.bulletText}>• Fruits: 4 disease classifications + healthy state</Text>
            <Text style={styles.bulletText}>• Stems: 2 disease classifications + healthy state</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <Text style={styles.bulletText}>• Automated plant part detection</Text>
            <Text style={styles.bulletText}>• Real-time camera and batch upload support</Text>
            <Text style={styles.bulletText}>• Comprehensive treatment recommendations</Text>
            <Text style={styles.bulletText}>• Cross-platform compatibility</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technology Stack</Text>
            <Text style={styles.text}><Text style={styles.boldText}>ML Framework:</Text> TensorFlow MobileNetV2</Text>
            <Text style={styles.text}><Text style={styles.boldText}>Backend:</Text> FastAPI (Python)</Text>
            <Text style={styles.text}><Text style={styles.boldText}>Frontend:</Text> React Native (Expo)</Text>
            <Text style={styles.text}><Text style={styles.boldText}>Storage:</Text> Cloudinary CDN</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AboutScreen;