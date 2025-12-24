import apiClient from './axios';

export interface PopularLocation {
  city: string;
  state?: string;
  country?: string;
  job_count?: number;
  event_count?: number;
}

export interface ChatbotUsageStats {
  total: number;
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface TimeSeriesPoint {
  date: string;
  event_count: number;
}

export const analyticsAPI = {
  getPopularLocations: async (limit: number = 10): Promise<PopularLocation[]> => {
    const response = await apiClient.get(`/api/analytics/popular-locations`, { params: { limit } });
    return response.data;
  },

  getChatbotUsage: async (): Promise<ChatbotUsageStats> => {
    const response = await apiClient.get(`/api/analytics/chatbot-usage`);
    return response.data;
  },

  getTimeSeries: async (days: number = 30): Promise<TimeSeriesPoint[]> => {
    const response = await apiClient.get(`/api/analytics/time-series`, { params: { days } });
    return response.data;
  },
};
