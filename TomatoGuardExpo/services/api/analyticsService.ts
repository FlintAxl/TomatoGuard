import { getApiClient } from './client';

// ========== FEATURED DISEASE SPOTLIGHT (Trends Tab) ==========

export interface SpotlightSampleImage {
  url: string;
  stage: string;
  confidence: number;
}

export interface SpotlightDailyPoint {
  date: string;
  count: number;
}

export interface SpotlightItem {
  has_data: boolean;
  disease_name?: string;
  plant_part?: string;
  cause?: string;
  description?: string;
  environmental_triggers?: string[];
  prevention_tips?: string[];
  stats?: {
    total_detections: number;
    avg_confidence: number;
    vs_last_period_pct: number;
    trend: 'up' | 'down';
    peak_week: string;
  };
  daily_trend?: SpotlightDailyPoint[];
  sample_images?: SpotlightSampleImage[];
}

export interface FeaturedDiseaseSpotlight {
  has_data: boolean;
  overall?: SpotlightItem;
  per_part?: {
    leaf: SpotlightItem;
    fruit: SpotlightItem;
    stem: SpotlightItem;
  };
}

export const fetchFeaturedDiseaseSpotlight = async (
  token?: string,
  days: number = 30
): Promise<FeaturedDiseaseSpotlight> => {
  const client = getApiClient(token);
  const response = await client.get(`/api/v1/analytics/featured-disease-spotlight?days=${days}`);
  return response.data.data;
};

// ========== ML ANALYTICS (Admin Dashboard) ==========

export interface MLAnalyticsData {
  overview: {
    total_analyses: number;
    today_analyses: number;
    healthy_count: number;
    diseased_count: number;
    avg_confidence: number;
    low_confidence_count: number;
    high_confidence_count: number;
  };
  disease_stats: {
    total: number;
    by_part: Record<string, Array<{
      disease: string;
      count: number;
      percentage: number;
      avg_confidence: number;
    }>>;
  };
  model_evaluation: {
    overall_accuracy: number;
    models: Record<string, {
      accuracy: number;
      loss: number | null;
      avg_confidence: number | null;
      per_class: Record<string, {
        precision: number;
        recall: number;
        f1: number;
      }>;
    }>;
  };
  detection_trends: {
    days: number;
    trends: Record<string, Array<{ date: string; count: number }>>;
  };
  confidence_distribution: {
    buckets: Array<{ label: string; count: number }>;
    per_disease: Array<{
      disease: string;
      avg_confidence: number;
      count: number;
    }>;
  };
  part_distribution: Array<{
    part: string;
    count: number;
    percentage: number;
  }>;
  recent_analyses: Array<{
    id: string;
    user_id: string;
    image_url: string;
    disease: string;
    confidence: number;
    plant_part: string;
    created_at: string;
  }>;
  scatter_plot_data: Array<{
    id: string;
    disease: string;
    confidence: number;
    plant_part: string;
    created_at: string;
    days_ago: number;
  }>;
}

export const fetchMLAnalytics = async (token?: string): Promise<MLAnalyticsData> => {
  const client = getApiClient(token);
  const response = await client.get('/api/v1/analytics/ml-overview');
  return response.data.data;
};

export interface AnalysisHistoryItem {
  id: string;
  user_id: string;
  image_url: string;
  disease: string;
  confidence: number;
  plant_part: string;
  created_at: string;
}

export interface AnalysisHistoryResponse {
  analyses: AnalysisHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalysisDetail {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  disease: string;
  confidence: number;
  plant_part: string;
  part_confidence: number;
  annotated_image: string | null;
  original_image: string | null;
  total_spots: number;
  bounding_boxes: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    area: number;
  }>;
  alternative_predictions: Array<{ disease: string; confidence: number }>;
  alternative_parts: Array<{ part: string; confidence: number }>;
  recommendations?: {
    disease?: string;
    plant_part?: string;
    description?: string;
    causal_agent?: string;
    immediate_actions?: string[];
    preventive_measures?: string[];
    organic_options?: string[];
    chemical_options?: string[];
    monitoring_tips?: string | string[];
    general_care?: string[];
    when_to_seek_help?: string[];
    confidence?: { score?: number; level?: string; note?: string };
  } | null;
}

export const fetchAnalysisHistory = async (
  token?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<AnalysisHistoryResponse> => {
  const client = getApiClient(token);
  const response = await client.get(`/api/v1/analytics/analysis-history?page=${page}&page_size=${pageSize}`);
  return response.data.data;
};

export const fetchAnalysisDetail = async (
  token?: string,
  analysisId?: string
): Promise<AnalysisDetail> => {
  const client = getApiClient(token);
  const response = await client.get(`/api/v1/analytics/analysis-detail/${analysisId}`);
  return response.data.data;
};

export const deleteAnalysis = async (
  token?: string,
  analysisId?: string
): Promise<{ status: string; message: string }> => {
  const client = getApiClient(token);
  const response = await client.delete(`/api/v1/analytics/analysis/${analysisId}`);
  return response.data;
};

// ========== USER ANALYSIS HISTORY FUNCTIONS ==========

export interface UserAnalysisHistoryItem {
  id: string;
  image_url: string;
  disease: string;
  confidence: number;
  created_at: string;
  is_favorite: boolean;
}

export const fetchUserAnalysisHistory = async (
  token?: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserAnalysisHistoryItem[]> => {
  const client = getApiClient(token);
  const response = await client.get(`/api/analysis/history?limit=${limit}&offset=${offset}`);
  return response.data;
};

export interface UserAnalysisDetail {
  id: string;
  user_id: string;
  image_url: string;
  cloudinary_public_id: string;
  created_at: string;
  analysis_result: {
    analysis?: {
      disease_detection?: {
        disease: string;
        confidence: number;
        alternative_predictions?: Array<{ disease: string; confidence: number }>;
      };
      part_detection?: {
        part: string;
        confidence: number;
        alternative_parts?: Array<{ part: string; confidence: number }>;
      };
      spot_detection?: {
        total_spots: number;
        bounding_boxes?: Array<{ x: number; y: number; w: number; h: number; area: number }>;
        annotated_image?: string;
      };
      recommendations?: {
        disease?: string;
        plant_part?: string;
        description?: string;
        causal_agent?: string;
        immediate_actions?: string[];
        preventive_measures?: string[];
        organic_options?: string[];
        chemical_options?: string[];
        monitoring_tips?: string | string[];
        general_care?: string[];
        when_to_seek_help?: string[];
        confidence?: { score?: number; level?: string; note?: string };
      };
    };
    disease_detection?: {
      disease: string;
      confidence: number;
      alternative_predictions?: Array<{ disease: string; confidence: number }>;
    };
    part_detection?: {
      part: string;
      confidence: number;
      alternative_parts?: Array<{ part: string; confidence: number }>;
    };
    spot_detection?: {
      total_spots: number;
      bounding_boxes?: Array<{ x: number; y: number; w: number; h: number; area: number }>;
      annotated_image?: string;
    };
    recommendations?: {
      disease?: string;
      plant_part?: string;
      description?: string;
      causal_agent?: string;
      immediate_actions?: string[];
      preventive_measures?: string[];
      organic_options?: string[];
      chemical_options?: string[];
      monitoring_tips?: string | string[];
      general_care?: string[];
      when_to_seek_help?: string[];
      confidence?: { score?: number; level?: string; note?: string };
    };
  };
}

export const fetchUserAnalysisDetail = async (
  token?: string,
  analysisId?: string
): Promise<UserAnalysisDetail> => {
  const client = getApiClient(token);
  const response = await client.get(`/api/analysis/${analysisId}`);
  return response.data;
};

export const deleteUserAnalysis = async (
  token?: string,
  analysisId?: string
): Promise<{ message: string }> => {
  const client = getApiClient(token);
  const response = await client.delete(`/api/analysis/${analysisId}`);
  return response.data;
};
