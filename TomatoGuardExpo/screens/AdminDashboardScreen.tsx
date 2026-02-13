import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useDrawer } from '../hooks/useDrawer';
import Drawer from '../components/Layout/Drawer';
import AdminLayout from '../components/Layout/AdminLayout';
import { MainStackNavigationProp, RootStackNavigationProp } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

// Analytics components
import MLOverviewCards from '../components/analytics/MLOverviewCards';
import ModelAccuracyPanel from '../components/analytics/ModelAccuracyPanel';
import DiseaseDetectionStats from '../components/analytics/DiseaseDetectionStats';
import DetectionTrendChart from '../components/analytics/DetectionTrendChart';
import ModelAccuracyScatterPlot from '../components/analytics/ModelAccuracyScatterPlot';
import ConfidenceDistribution from '../components/analytics/ConfidenceDistribution';
import PlantPartDistribution from '../components/analytics/PlantPartDistribution';
import AnalysisHistory from '../components/analytics/AnalysisHistory';
import AnalysisDetailModal from '../components/analytics/AnalysisDetailModal';
import UserManagement from '../components/analytics/UserManagement';
import { fetchMLAnalytics, MLAnalyticsData } from '../services/api/analyticsService';

const AdminDashboardScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const mainNavigation = useNavigation<MainStackNavigationProp>();
  const { authState } = useAuth();
  const { drawerOpen, drawerAnimation, toggleDrawer, closeDrawer } = useDrawer();

  const [analytics, setAnalytics] = useState<MLAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'users'>('analytics');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchMLAnalytics(authState.accessToken || undefined);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.detail || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.accessToken]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleNavItemPress = (itemId: string) => {
    if (itemId === 'logout') return;
    if (itemId === 'profile') {
      mainNavigation.navigate('Profile');
      return;
    }
    if (itemId === 'admin') {
      closeDrawer();
      return;
    }
    mainNavigation.navigate('MainApp');
    closeDrawer();
  };

  // ---- Render helpers ----
  const renderLoading = () => (
    <View style={s.centerContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={s.loadingText}>Loading ML Analytics...</Text>
    </View>
  );

  const renderError = () => (
    <View style={s.centerContainer}>
      <Text style={s.errorIcon}>⚠️</Text>
      <Text style={s.errorText}>{error}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={() => loadAnalytics()}>
        <Text style={s.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSelectAnalysis = (id: string) => {
    setSelectedAnalysisId(id);
    setDetailModalVisible(true);
  };

  const renderTabs = () => (
    <View style={s.tabContainer}>
      <TouchableOpacity
        style={[s.tab, activeTab === 'analytics' && s.activeTab]}
        onPress={() => setActiveTab('analytics')}
      >
        <Text style={[s.tabText, activeTab === 'analytics' && s.activeTabText]}>
          Analytics
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.tab, activeTab === 'history' && s.activeTab]}
        onPress={() => setActiveTab('history')}
      >
        <Text style={[s.tabText, activeTab === 'history' && s.activeTabText]}>
          History
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.tab, activeTab === 'users' && s.activeTab]}
        onPress={() => setActiveTab('users')}
      >
        <Text style={[s.tabText, activeTab === 'users' && s.activeTabText]}>
          User Analytics
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalyticsTab = () => {
    if (!analytics) return null;
    
    return (
      <>
        {/* 1. Overview KPI cards */}
        <MLOverviewCards data={analytics.overview} />

        {/* 2. Model Accuracy (static eval metrics, expandable per-class) */}
        <ModelAccuracyPanel data={analytics.model_evaluation} />

        {/* 3. Disease Detection Statistics (all diseases, 0-filled) */}
        <DiseaseDetectionStats data={analytics.disease_stats} />

        {/* 4. Detection Trend (daily bar chart per model) */}
        <DetectionTrendChart data={analytics.detection_trends} />

        {/* 5. Model Accuracy Scatter Plot */}
        <ModelAccuracyScatterPlot data={analytics.scatter_plot_data || []} />

        {/* 6. Confidence Distribution (buckets + per-disease avg) */}
        <ConfidenceDistribution 
          data={analytics.confidence_distribution}
          partDistribution={analytics.part_distribution}
          diseaseStats={analytics.disease_stats}
          analyses={analytics.scatter_plot_data || []}
        />

        {/* 7. Plant Part Distribution */}
        <PlantPartDistribution data={analytics.part_distribution} />
      </>
    );
  };

  const renderHistoryTab = () => {
    return (
      <AnalysisHistory onSelectAnalysis={handleSelectAnalysis} />
    );
  };

  const renderUsersTab = () => {
    return (
      <UserManagement />
    );
  };

  const renderDashboard = () => {
    if (!analytics) return null;
    return (
      <>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>ML Analytics Dashboard</Text>
          <Text style={s.headerSub}>
            Tomato disease detection model performance & statistics
          </Text>
        </View>

        {renderTabs()}
        <View style={s.tabContent}>
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'users' && renderUsersTab()}
        </View>
      </>
    );
  };

  return (
    <AdminLayout
      drawerOpen={drawerOpen}
      drawerAnimation={drawerAnimation}
      pageTitle="ML Analytics"
      pageSubtitle="Model performance & detection statistics"
      userEmail={authState.user?.email?.split('@')[0]}
      onMenuPress={toggleDrawer}
      onCloseDrawer={closeDrawer}
      drawerComponent={
        <Drawer
          activeTab="admin"
          onItemPress={handleNavItemPress}
          animation={drawerAnimation}
          drawerOpen={drawerOpen}
          onClose={closeDrawer}
        />
      }
    >
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAnalytics(true)}
            tintColor="#6366f1"
            colors={['#6366f1']}
            progressBackgroundColor="#1e293b"
          />
        }
      >
        {loading ? renderLoading() : error ? renderError() : renderDashboard()}
      </ScrollView>

      <AnalysisDetailModal
        analysisId={selectedAnalysisId}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedAnalysisId(null);
        }}
      />
    </AdminLayout>
  );
};

const s = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    paddingHorizontal: 20,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
  },
});

export default AdminDashboardScreen;
