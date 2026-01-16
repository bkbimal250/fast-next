/**
 * Contact API client
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export enum ContactSubject {
  Therapist='Female Therapist jobs',
  spaTherapist='Thai Therapist jobs',
  manager='Male Spa Manager jobs',
  receptionist='Female Receptionist jobs',
  housekeeping='Male Housekeeping jobs',

}

export interface ContactCreate {
  name: string;
  phone: string;
  message?: string;
  subject: ContactSubject;
}

export interface ContactResponse {
  id: number;
  name: string;
  phone: string;
  message?: string;
  subject: string;
  status: string;
  read_at?: string;
  replied_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

export const contactAPI = {
  async submitContact(data: ContactCreate): Promise<ContactResponse> {
    const response = await axios.post<ContactResponse>(
      `${API_URL}/api/contact/`,
      data
    );
    return response.data;
  },

  /**
   * Get all contact messages (admin/manager only)
   */
  async getContacts(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<ContactResponse[]> {
    const { tokenManager } = await import('./auth');
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_URL}/api/contact/?${queryString}`
      : `${API_URL}/api/contact/`;

    const response = await axios.get<ContactResponse[]>(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get a specific contact message by ID (admin/manager only)
   */
  async getContact(contactId: number): Promise<ContactResponse> {
    const { tokenManager } = await import('./auth');
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get<ContactResponse>(
      `${API_URL}/api/contact/${contactId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Update contact message status (admin/manager only)
   */
  async updateContactStatus(contactId: number, status: string): Promise<ContactResponse> {
    const { tokenManager } = await import('./auth');
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put<ContactResponse>(
      `${API_URL}/api/contact/${contactId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get contact message statistics (admin/manager only)
   */
  async getContactStats(): Promise<ContactStats> {
    const { tokenManager } = await import('./auth');
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get<ContactStats>(
      `${API_URL}/api/contact/stats/summary`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Delete a contact message (admin only)
   */
  async deleteContact(contactId: number, permanent: boolean = false): Promise<void> {
    const { tokenManager } = await import('./auth');
    const token = tokenManager.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.delete(`${API_URL}/api/contact/${contactId}`, {
      params: { permanent },
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

