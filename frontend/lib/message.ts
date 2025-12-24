/**
 * Message API client
 */

import axios from 'axios';
import { tokenManager } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

export interface Message {
  id: number;
  job_id: number;
  sender_name: string;
  phone: string;
  email?: string;
  message: string;
  status: string;
  read_at?: string;
  replied_at?: string;
  read_by_id?: number;
  replied_by_id?: number;
  read_by_name?: string;
  replied_by_name?: string;
  created_at: string;
  updated_at?: string;
  job?: {
    id: number;
    title: string;
    slug: string;
  };
}

export interface MessageCreate {
  job_id: number;
  sender_name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface MessageUpdate {
  status?: string;
}

export interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

export const messageAPI = {
  /**
   * Create a new message (public, no auth required)
   */
  async createMessage(data: MessageCreate): Promise<Message> {
    const response = await axios.post(`${API_URL}/api/messages/`, data);
    return response.data;
  },

  /**
   * Get all messages (admin/manager only)
   */
  async getMessages(params?: {
    skip?: number;
    limit?: number;
    job_id?: number;
    status?: string;
  }): Promise<Message[]> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.job_id !== undefined) queryParams.append('job_id', params.job_id.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_URL}/api/messages/?${queryString}`
      : `${API_URL}/api/messages/`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('[DEBUG] Messages API response:', response.data); // Debug log
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get a specific message by ID (admin/manager only)
   */
  async getMessage(messageId: number): Promise<Message> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/api/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Update message status (admin/manager only)
   */
  async updateMessageStatus(messageId: number, status: string): Promise<Message> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_URL}/api/messages/${messageId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get message statistics (admin/manager only)
   */
  async getMessageStats(): Promise<MessageStats> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/api/messages/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

