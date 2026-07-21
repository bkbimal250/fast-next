import apiClient from './axios';

export type FreeListingStatus = 'new' | 'contacted' | 'verified' | 'credentials_sent' | 'closed';

export type FreeListingEnquiryCreate = {
  contact_name: string;
  phone: string;
  email: string;
  business_name: string;
  business_type: 'spa' | 'salon' | 'wellness_center' | 'other';
  address?: string;
  city?: string;
  website?: string;
  message?: string;
};

export type FreeListingEnquiry = FreeListingEnquiryCreate & {
  id: number;
  status: FreeListingStatus;
  is_verified: boolean;
  followup_notes?: string;
  credential_email?: string;
  credential_notes?: string;
  credentials_sent_at?: string;
  verified_at?: string;
  contacted_at?: string;
  created_at: string;
  updated_at: string;
};

export type FreeListingStats = {
  total: number;
  new: number;
  contacted: number;
  verified: number;
  credentials_sent: number;
};

export const enquiryFreeListAPI = {
  submit: async (data: FreeListingEnquiryCreate): Promise<FreeListingEnquiry> => {
    const response = await apiClient.post('/api/enquiryfreelist/', data);
    return response.data;
  },

  getAll: async (params?: {
    skip?: number;
    limit?: number;
    status_filter?: FreeListingStatus;
    verified?: boolean;
  }): Promise<FreeListingEnquiry[]> => {
    const response = await apiClient.get('/api/enquiryfreelist/', { params });
    return response.data;
  },

  getStats: async (): Promise<FreeListingStats> => {
    const response = await apiClient.get('/api/enquiryfreelist/stats/summary');
    return response.data;
  },

  updateFollowup: async (
    enquiryId: number,
    data: { status?: FreeListingStatus; followup_notes?: string }
  ): Promise<FreeListingEnquiry> => {
    const response = await apiClient.put(`/api/enquiryfreelist/${enquiryId}/followup`, data);
    return response.data;
  },

  verify: async (
    enquiryId: number,
    data: { is_verified: boolean; followup_notes?: string }
  ): Promise<FreeListingEnquiry> => {
    const response = await apiClient.put(`/api/enquiryfreelist/${enquiryId}/verify`, data);
    return response.data;
  },

  markCredentialsSent: async (
    enquiryId: number,
    data: { credential_email?: string; credential_notes?: string }
  ): Promise<FreeListingEnquiry> => {
    const response = await apiClient.put(`/api/enquiryfreelist/${enquiryId}/credentials`, data);
    return response.data;
  },
};
