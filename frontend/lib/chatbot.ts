/**
 * Chatbot API client
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010';

export interface ChatbotJob {
  id: number;
  title: string;
  spa_name: string;
  location: string;
  salary?: string;
  slug: string;
  apply_url: string;
}

export interface ChatbotRequest {
  message: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatbotSpa {
  id: number;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  rating?: number;
  view_url: string;
  slug: string;
}

export interface ChatbotResponse {
  message: string;
  jobs: ChatbotJob[];
  spas?: ChatbotSpa[];
  suggestions?: string[];
}

export const chatbotAPI = {
  async search(data: ChatbotRequest): Promise<ChatbotResponse> {
    const response = await axios.post<ChatbotResponse>(
      `${API_URL}/api/chatbot/search`,
      data
    );
    return response.data;
  },
};

