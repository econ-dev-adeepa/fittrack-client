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

// api.interceptors.request.use(async (config) => {
//   const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJNkJMa1MyUlRlazk3Rl9ZSmhTN0s2S2NRSEVvUHBGTURHa0lEX3dGczVJIn0.eyJleHAiOjE3NzQ1MDMyMzgsImlhdCI6MTc3NDUwMTQzOCwianRpIjoib25ydHJvOmRjYTc3YzU0LTFlZjItMjU4Ni1hZjk4LWE0Y2M5M2FjMzkzNyIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZWFsbXMvZml0dHJhY2siLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNjY1NWVlZmQtNjI2NS00NGNiLWI4ZmUtZGNiOGYxMTM0YzdlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZml0dHJhY2stbW9iaWxlIiwic2lkIjoicm15NG9lRldWNDdZdTF2cElfd1JKeWNJIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1maXR0cmFjayIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJjdXN0b21lciJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInVzZXJfcm9sZSI6WyJkZWZhdWx0LXJvbGVzLWZpdHRyYWNrIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImN1c3RvbWVyIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiVGVzdCBDdXN0b21lciIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3RjdXN0b21lciIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJDdXN0b21lciIsImVtYWlsIjoidGVzdGN1c3RvbWVyQGZpdHRyYWNrLmNvbSJ9.TcpfzN9ssqcnSu7mrtd_9kADuSf0OZdE_vpinR7MAX9VshWrDn00noxZUgjdK7TRtUjIJlN6ne37SJ2EfdYLq_H2LStYijKNgrIWZDP8xEg_ScnZl-Q0-iEzWlI6BcmH_ulXZOCumgxbIwLR7hhXdm32lJmWmlF_m6gToszGM5--FH49a9XAwhEI24JIFh6x7CYhZVtnmuUrpt-hVrXrY2DoYvvMi6cwFOs0XXHfcGPbk7OZGOU7wzsnBWhj4qVNrN9dPhHAEvachybXZ7sKp7gRpxSDCAvPwkU072HVBoYAmotBXJKvPB4vC0vQFA5erW2XaLfzQ3whkq-LmveYUg";
//   config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

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
    api.get(`/affiliations/gym/${gymId}/coaches/approved`),
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
  remove: (id: string) => 
    api.delete(`/affiliations/${id}`),
};


export const gymsAPI = {
  getAll: () => api.get('/gyms'),
  getAdminGyms: () => api.get('/gyms?is_admin=true'),
  create: (data: { name: string; location: string; description?: string; phone?: string }) =>
    api.post('/gyms', data),
  enroll: (gymId: string) =>
    api.post('/affiliations', { gymId, type: 'CUSTOMER' }),
  enrollAsCoach: (gymId: string) => 
    api.post('/affiliations', { gymId, type: 'COACH' }),
  getMyGyms: () => api.get('/affiliations/my'),
};

//Training Plans API
export const trainingPlansAPI = {
  create: (data: {
    programId: string;
    name: string;
    description?: string;
    sessionsPerWeek?: number;
    sessionDuration?: number;
    totalSlots?: number;
    difficulty?: string;
    programDuration?: number;
  }) => api.post('/training-plans', data),

  getByProgram: (programId: string) =>
    api.get(`/training-plans/program/${programId}`),

  remove: (id: string) =>
    api.delete(`/training-plans/${id}`),
};

// Users API
export const usersAPI = {
  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),
};

export default api;