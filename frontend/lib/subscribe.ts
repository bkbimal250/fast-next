/**
 * Subscription API client
 */

import axios from 'axios';
import { tokenManager } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

export type SubscriptionFrequency = 'daily' | 'weekly' | 'monthly' | 'instant';

export interface Subscription {
  id: number;
  email: string;
  name?: string;
  frequency: SubscriptionFrequency;
  is_active: boolean;
  city_id?: number;
  state_id?: number;
  job_category_id?: number;
  job_type_id?: number;
  last_email_sent_at?: string;
  emails_sent_count: number;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionCreate {
  email: string;
  name?: string;
  frequency?: SubscriptionFrequency;
  city_id?: number;
  state_id?: number;
  job_category_id?: number;
  job_type_id?: number;
}

export interface SubscriptionUpdate {
  frequency?: SubscriptionFrequency;
  is_active?: boolean;
  city_id?: number;
  state_id?: number;
  job_category_id?: number;
  job_type_id?: number;
}

export const subscribeAPI = {
  /**
   * Subscribe to job notifications
   */
  async subscribe(data: SubscriptionCreate): Promise<Subscription> {
    const response = await axios.post(`${API_URL}/api/subscriptions/`, data);
    return response.data;
  },

  /**
   * Get subscriptions (for logged-in user or by email)
   */
  async getSubscriptions(email?: string): Promise<Subscription[]> {
    const token = tokenManager.getToken();
    const params: any = {};
    if (email) params.email = email;

    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/api/subscriptions/`, {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Update subscription preferences
   */
  async updateSubscription(
    subscriptionId: number,
    data: SubscriptionUpdate
  ): Promise<Subscription> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_URL}/api/subscriptions/${subscriptionId}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Unsubscribe using token (from email link)
   */
  async unsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_URL}/api/subscriptions/unsubscribe`, {
      token,
    });
    return response.data;
  },

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: number): Promise<void> {
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.delete(`${API_URL}/api/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

