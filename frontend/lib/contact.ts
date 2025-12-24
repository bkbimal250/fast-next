/**
 * Contact API client
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export enum ContactSubject {
  JOBS = 'jobs',
  JOBS_LISTING = 'jobs listing',
  OTHERS = 'others',
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
  created_at: string;
}

export const contactAPI = {
  async submitContact(data: ContactCreate): Promise<ContactResponse> {
    const response = await axios.post<ContactResponse>(
      `${API_URL}/api/contact/`,
      data
    );
    return response.data;
  },
};

