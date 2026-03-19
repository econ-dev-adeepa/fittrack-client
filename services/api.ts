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
  const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJNkJMa1MyUlRlazk3Rl9ZSmhTN0s2S2NRSEVvUHBGTURHa0lEX3dGczVJIn0.eyJleHAiOjE3NzM4OTc4ODAsImlhdCI6MTc3Mzg5NjA4MCwianRpIjoib25ydHJvOjA0NjlhZTZkLWMyNjctOGM2My0xOWVlLTI3N2RlZDA1ODcyZCIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZWFsbXMvZml0dHJhY2siLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNjY1NWVlZmQtNjI2NS00NGNiLWI4ZmUtZGNiOGYxMTM0YzdlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZml0dHJhY2stbW9iaWxlIiwic2lkIjoidXVVX1NhaUs1UVRFSzI2VUtnRGR4TzRyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWZpdHRyYWNrIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImN1c3RvbWVyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJUZXN0IEN1c3RvbWVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdGN1c3RvbWVyIiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmYW1pbHlfbmFtZSI6IkN1c3RvbWVyIiwiZW1haWwiOiJ0ZXN0Y3VzdG9tZXJAZml0dHJhY2suY29tIn0.VZBb5iCfSfvgw2OWDe62dxmyGqzZxEmgPEt-XcXdhsqfjeDNr3BV1lFGQFmyOO9bZVlm23LltqdiStyRGpdaaefHWw1SvDTCXUkBG6RDAfHk-rcJtpSIiCDUAa1iuNY0a1IstNfOkjksqpIDwgFcpsxArENHw4Q3RHCmRCvh5B0_YpAcHFAQqBKd1pNtUznJDL3-CZBrdNQQJQuS9YD5ofYYFUo1Kws3w4TGMJIB0gHukUYfKI5nX7cds_cjoS3XYHEJyGuzTRoBGK0vPLscIjuuoof0A-dKc531_Jgz1RoajWGA5yMXsoMi3ga4tM1A5h1kULCvyxE_WRhV_SwLxw";
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