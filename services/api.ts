import axios from 'axios';
import keyStore from '../stores/keyStore';
import tokenRefreshInterceptor from './refreshInterceptor';
import setupTokenRefreshInterceptor from './refreshInterceptor';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(async (config) => {
  const accessToken = keyStore.getState().accessToken;
  if (!accessToken) {
    return config;
  }

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

setupTokenRefreshInterceptor(api);

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
  getPendingByGym: (gymId: string) =>
  api.get(`/programs/gym/${gymId}/pending`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/programs/${id}/status`, { status }),
};

// PT Relationships API
export const ptAPI = {
  sendRequest: (data: { coachId: string; gymId: string; preferredDays?: string; preferredTime?: string; notes?: string }) =>
    api.post('/pt-relationships', data),
  getMyRequests: () =>
    api.get('/pt-relationships/requests'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/pt-relationships/${id}/coach-status`, { status }),
  getMyClients: () =>
    api.get('/pt-relationships/my-clients'),
  getMyStatus: () =>
    api.get('/pt-relationships/my-status'),
  getMyTrainer: () =>
    api.get('/pt-relationships/my-trainer'),
  getCoachApprovedByGym: (gymId: string) =>
  api.get(`/pt-relationships/gym/${gymId}/coach-approved`),
  updateStatusByAdmin: (id: string, status: string) =>
    api.patch(`/pt-relationships/${id}/admin-status`, { status }),
};

// Affiliations API
export const affiliationsAPI = {
  getCoachesByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/coaches`),
  getActiveCoachesByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/coaches/approved`),
  getActiveCustomersByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/customers/approved`),
  getMyAffiliations: () =>
    api.get('/affiliations/my'),
  getPendingByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/pending`),
  getPendingCoachesByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/coaches/pending`),
  getPendingCustomersByGym: (gymId: string) =>
    api.get(`/affiliations/gym/${gymId}/customers/pending`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/affiliations/${id}/status`, { status }),
};


export const gymsAPI = {
  getAll: () => api.get('/gyms'),
  getAdminGyms: () => api.get('/gyms?is_admin=true'),
  create: (data: { name: string; location: string; description?: string; phone?: string }) =>
    api.post('/gyms', data),
  enroll: (gymId: string) =>
    api.post('/affiliations', { gymId, type: 'CUSTOMER' }),
  getMyGyms: () => api.get('/affiliations/my'),
};

// Users API
export const usersAPI = {
  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),
};

export default api;