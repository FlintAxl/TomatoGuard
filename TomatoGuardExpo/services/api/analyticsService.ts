import { getApiClient } from './client';

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
}

export const fetchMLAnalytics = async (token?: string): Promise<MLAnalyticsData> => {
  const client = getApiClient(token);
  const response = await client.get('/api/v1/analytics/ml-overview');
  return response.data.data;
};
