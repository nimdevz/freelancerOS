import { FreelancerOsClient } from '@freelanceros/api-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = new FreelancerOsClient({
  baseUrl: API_BASE_URL,
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('freelanceros_token') || 'demo-token';
    }
    return 'demo-token';
  },
});
