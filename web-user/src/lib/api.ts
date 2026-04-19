import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Performer {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  address?: string;
  city?: string;
}

export interface Concert {
  id: number;
  title: string;
  date: string;
  url: string;
  venue: Venue;
  performers: Performer[];
}

export interface User {
  id: number;
  email: string;
}

export const apiService = {
  // User/Identity
  getOrCreateUser: async (email: string): Promise<User> => {
    const response = await api.post('/users/', { email });
    return response.data;
  },

  // Discovery
  getPerformers: async (): Promise<Performer[]> => {
    const response = await api.get('/performers/');
    return response.data;
  },

  getVenues: async (): Promise<Venue[]> => {
    const response = await api.get('/venues/');
    return response.data;
  },

  getConcerts: async (search?: string): Promise<Concert[]> => {
    const response = await api.get('/concerts/', { params: search ? { q: search } : {} });
    return response.data;
  },

  // Subscriptions
  getSubscriptions: async (userId: number) => {
    const response = await api.get(`/subscriptions/user/${userId}`);
    return response.data;
  },

  subscribeToPerformer: async (userId: number, performerId: number) => {
    return api.post('/subscriptions/performer', { user_id: userId, performer_id: performerId });
  },

  subscribeToVenue: async (userId: number, venueId: number) => {
    return api.post('/subscriptions/venue', { user_id: userId, venue_id: venueId });
  },

  unsubscribe: async (subscriptionId: number) => {
    return api.delete(`/subscriptions/${subscriptionId}`);
  },
};

export default api;
