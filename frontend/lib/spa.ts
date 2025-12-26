/**
 * SPA API client
 */

import apiClient from './axios';

export interface Spa {
  id: number;
  name: string;
  slug: string;
  description?: string;
  phone: string;
  email: string;
  logo_image?: string;
  address?: string;
  website?: string;
  directions?: string;
  opening_hours?: string;
  closing_hours?: string;
  booking_url_website?: string;
  country_id: number;
  state_id: number;
  city_id: number;
  area_id?: number;
  latitude?: number;
  longitude?: number;
  spa_images?: string[];
  rating?: number;
  reviews?: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
}

export const spaAPI = {
  getSpas: async (params?: { skip?: number; limit?: number; is_active?: boolean }) => {
    const response = await apiClient.get('/api/spas/', { params });
    return response.data;
  },

  getSpaById: async (id: number) => {
    const response = await apiClient.get(`/api/spas/${id}`);
    return response.data;
  },

  getSpaBySlug: async (slug: string) => {
    const response = await apiClient.get(`/api/spas/slug/${slug}`);
    return response.data;
  },

  createSpa: async (formData: FormData) => {
    const response = await apiClient.post('/api/spas/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateSpa: async (spaId: number, formData: FormData) => {
    const response = await apiClient.put(`/api/spas/${spaId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteSpa: async (spaId: number, permanent: boolean = false) => {
    const response = await apiClient.delete(`/api/spas/${spaId}`, { params: { permanent } });
    return response.data;
  },

  getSpasNearMe: async (latitude: number, longitude: number, radiusKm: number = 10): Promise<Spa[]> => {
    const response = await apiClient.get('/api/spas/near-me', {
      params: { latitude, longitude, radius_km: radiusKm },
    });
    return response.data;
  },

  // Recruiter-specific endpoints
  getMySpa: async (): Promise<Spa> => {
    const response = await apiClient.get('/api/spas/recruiter/my-spa');
    return response.data;
  },

  trackBookingClick: async (spaId: number): Promise<{ status: string; booking_click_count?: number }> => {
    const response = await apiClient.post(`/api/spas/${spaId}/track-booking-click`);
    return response.data;
  },
};

export const locationAPI = {
  getCountries: async () => {
    const response = await apiClient.get('/api/locations/countries');
    return response.data;
  },

  getStates: async (countryId?: number) => {
    const params = countryId ? { country_id: countryId } : {};
    const response = await apiClient.get('/api/locations/states', { params });
    return response.data;
  },

  getCities: async (stateId?: number, countryId?: number) => {
    const params: any = {};
    if (stateId) params.state_id = stateId;
    if (countryId) params.country_id = countryId;
    const response = await apiClient.get('/api/locations/cities', { params });
    return response.data;
  },

  getAreas: async (cityId?: number) => {
    const params = cityId ? { city_id: cityId } : {};
    const response = await apiClient.get('/api/locations/areas', { params });
    return response.data;
  },
};

