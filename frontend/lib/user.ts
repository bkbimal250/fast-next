import apiClient from './axios';

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

export interface UserCreate {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'manager' | 'admin' | 'recruiter';
  is_active?: boolean;
  is_verified?: boolean;
  bio?: string;
  address?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'manager' | 'admin' | 'recruiter';
  bio?: string;
  address?: string;
  city_id?: number;
  state_id?: number;
  country_id?: number;
  is_active?: boolean;
  is_verified?: boolean;
  managed_spa_id?: number;
}

export interface Permission {
  id: number;
  user_id: number;
  can_post_jobs: boolean;
  can_post_free_jobs: boolean;
  can_post_premium_jobs: boolean;
  can_create_spa: boolean;
  can_edit_spa: boolean;
  can_manage_users: boolean;
  can_manage_all_jobs: boolean;
  can_manage_all_spas: boolean;
  created_at: string;
  updated_at: string;
}

export const userAPI = {
  getAllUsers: async (skip: number = 0, limit: number = 100): Promise<User[]> => {
    const response = await apiClient.get(`/api/users/`, { params: { skip, limit } });
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (data: UserCreate): Promise<User> => {
    const response = await apiClient.post(`/api/users/`, data);
    return response.data;
  },

  updateUser: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`);
  },

  getMyPermissions: async (): Promise<Permission> => {
    const response = await apiClient.get(`/api/users/me/permissions`);
    return response.data;
  },
};

