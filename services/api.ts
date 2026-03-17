import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Programs API
export const programsAPI = {
  create: (data: { title: string; description?: string; gymId: string; schedule?: string }) =>
    api.post('/programs', data),
  submitForApproval: (id: string) =>
    api.patch(`/programs/${id}/submit`),
  getMyPrograms: () =>
    api.get('/programs/my'),
  getApprovedByGym: (gymId: string) =>
    api.get(`/programs/gym/${gymId}/approved`),
};

// PT Relationships API
export const ptAPI = {
  sendRequest: (data: { coachId: string; gymId: string }) =>
    api.post('/pt-relationships', data),
  getMyRequests: () =>
    api.get('/pt-relationships/requests'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/pt-relationships/${id}/status`, { status }),
  getMyClients: () =>
    api.get('/pt-relationships/my-clients'),
  getMyStatus: () =>
    api.get('/pt-relationships/my-status'),
  getMyTrainer: () =>
    api.get('/pt-relationships/my-trainer'),
};

// Affiliations API
export const affiliationsAPI = {
  getCoachesByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/coaches`),
  getMyAffiliations: () =>
    api.get('/affiliations/my'),
};

export default api;