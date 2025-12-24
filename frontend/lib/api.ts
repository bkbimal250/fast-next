/**
 * API client utilities
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spajob.api.spajob.spajobs.co.in';

export async function fetchJobs(params?: {
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  title?: string;
  city_id?: number;
  state_id?: number;
  job_type?: string;
  is_featured?: boolean;
}) {
  const url = new URL(`${API_URL}/api/jobs`);
  if (params?.lat && params?.lng) {
    url.searchParams.append('latitude', params.lat.toString());
    url.searchParams.append('longitude', params.lng.toString());
    url.searchParams.append('radius_km', (params.radius || 10).toString());
  }
  if (params?.title) url.searchParams.append('title', params.title);
  if (params?.city_id) url.searchParams.append('city_id', params.city_id.toString());
  if (params?.state_id) url.searchParams.append('state_id', params.state_id.toString());
  if (params?.job_type) url.searchParams.append('job_type', params.job_type);
  if (params?.is_featured !== undefined) url.searchParams.append('is_featured', params.is_featured.toString());

  const response = await axios.get(url.toString());
  return response.data;
}

export async function fetchJobBySlug(slug: string) {
  const response = await axios.get(`${API_URL}/api/jobs/${slug}`);
  return response.data;
}

export async function fetchPopularJobs(limit: number = 10) {
  const response = await axios.get(`${API_URL}/api/jobs/popular?limit=${limit}`);
  return response.data;
}

export async function fetchSpasNearMe(lat: number, lng: number, radius: number = 10) {
  const response = await axios.get(
    `${API_URL}/api/spas/near-me?latitude=${lat}&longitude=${lng}&radius_km=${radius}`
  );
  return response.data;
}

export async function submitApplication(formData: FormData, token?: string) {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await axios.post(`${API_URL}/api/applications/`, formData, { headers });
  return response.data;
}

export async function sendMessage(messageData: object) {
  const response = await axios.post(`${API_URL}/api/messages/`, messageData);
  return response.data;
}

export async function trackJobView(jobId: number) {
  try {
    await axios.post(`${API_URL}/api/jobs/${jobId}/track-view`);
  } catch (error) {
    // Silent fail
  }
}

export async function trackJobApplyClick(jobId: number) {
  try {
    await axios.post(`${API_URL}/api/jobs/${jobId}/track-apply-click`);
  } catch (error) {
    // Silent fail
  }
}

