/**
 * Authentication utilities and API client
 */

import axios from 'axios';
import apiClient from './axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'manager' | 'admin' | 'recruiter';
  profile_photo?: string;
  resume_path?: string;
  bio?: string;
  address?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
  is_active: boolean;
  is_verified: boolean;
  managed_spa_id?: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Auth API functions
export const authAPI = {
  register: async (data: { name: string; email: string; phone: string; password: string }) => {
    const response = await axios.post(`${API_URL}/api/users/register`, data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post(`${API_URL}/api/users/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await axios.post(`${API_URL}/api/users/reset-password`, {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  getCurrentUser: async (token?: string): Promise<User> => {
    // Token is automatically added by apiClient interceptor
    const response = await apiClient.get(`/api/users/me`);
    return response.data;
  },

  updateProfile: async (token: string, data: Partial<User>) => {
    // Token is automatically added by apiClient interceptor
    const response = await apiClient.put(`/api/users/me`, data);
    return response.data;
  },

  changePassword: async (token: string, currentPassword: string, newPassword: string) => {
    // Token is automatically added by apiClient interceptor
    const response = await apiClient.post(`/api/users/me/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getMyApplications: async (token?: string) => {
    // Token is automatically added by apiClient interceptor
    const response = await apiClient.get(`/api/users/me/applications`);
    return response.data;
  },
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
};

