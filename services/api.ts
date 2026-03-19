import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

api.interceptors.request.use(async (config) => {
  const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJNkJMa1MyUlRlazk3Rl9ZSmhTN0s2S2NRSEVvUHBGTURHa0lEX3dGczVJIn0.eyJleHAiOjE3NzM5MDY5ODYsImlhdCI6MTc3MzkwNTE4NiwianRpIjoib25ydHJvOjJjYTFhMDU0LTIzYWMtYWRmYS0zODg2LTE4MWIyZWM3NzgxNCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZWFsbXMvZml0dHJhY2siLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZWU5ZjIyOWQtNWY1My00YjVhLWJkZWYtOTY2YTM1YmU2NTVmIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZml0dHJhY2stbW9iaWxlIiwic2lkIjoidFlJYk9sUWtsZVVQWTlIRmp3UkJGRzlCIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWZpdHRyYWNrIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImd5bV9hZG1pbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiVGVzdCBHeW1BZG1pbiIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3RneW1hZG1pbiIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJHeW1BZG1pbiIsImVtYWlsIjoidGVzdGd5bWFkbWluQGZpdHRyYWNrLmNvbSJ9.dfdYNx7GleeU898tfdFd72PtCxbZqj1F0pI7PToLLI2G47eCMPoa1Jm5Y39eptvhlqJWfktB3MbYXKScKumGfJoiWJ46M60PoZQcWfTMI6Jte9fGS4Li1erwE8U2eWwYUxii-rQ9oaCcFm4g641ZKJW_VqSb_U6t1aeOPElQRVpkUeJK7OUBLb8tYtyPoN-7qriftGscud7gL7SqaUCryq3RHvMkJMB34ErMGeWbe2y9LqdKz8hmZouboLh_vMdal2Q9vX5tWS60EWlQtj-Hqj2ceHd3TB4bmcA6I78kDO9da8wMLNJiN7o3LlwWcq-5pKa36K7uqQNiCHTLy9odiw";
  config.headers.Authorization = `Bearer ${token}`;

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
  getMyAffiliations: () =>
    api.get('/affiliations/my'),
  getPendingByGym: (gymId: string) =>
  api.get(`/affiliations/gym/${gymId}/pending`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/affiliations/${id}/status`, { status }),
};

export default api;