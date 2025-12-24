import apiClient from './axios';

export interface Application {
  id: number;
  job_id: number;
  user_id?: number;
  name: string;
  email: string;
  phone: string;
  experience?: string;
  location?: string;
  cv_file_path?: string;
  status: string;
  created_at: string;
  job?: {
    id: number;
    title: string;
    slug: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    spa_id?: number;
    city_id?: number;
    state_id?: number;
    country_id?: number;
    job_type_id?: number;
    job_category_id?: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const applicationAPI = {
  getAllApplications: async (params?: {
    job_id?: number;
    user_id?: number;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<Application[]> => {
    const response = await apiClient.get(`/api/applications/`, { params });
    return response.data;
  },

  getApplicationById: async (id: number): Promise<Application> => {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data;
  },

  updateApplication: async (id: number, data: { status?: string }): Promise<Application> => {
    const response = await apiClient.put(`/api/applications/${id}`, data);
    return response.data;
  },

  deleteApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/applications/${id}`);
  },

  // Recruiter-specific endpoints
  getMyApplications: async (params?: { skip?: number; limit?: number }): Promise<Application[]> => {
    const response = await apiClient.get('/api/applications/recruiter/my-applications', { params });
    return response.data;
  },

  // Create application (public - no auth required)
  createApplication: async (formData: FormData): Promise<Application> => {
    const response = await apiClient.post('/api/applications/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

