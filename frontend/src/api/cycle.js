import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

export const cycleService = {
  getAll: () => apiClient.get(API_ENDPOINTS.CYCLES.BASE),
  getById: (id) => apiClient.get(API_ENDPOINTS.CYCLES.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.CYCLES.BASE, data),
  updateStatus: (id, status) => apiClient.patch(API_ENDPOINTS.CYCLES.STATUS(id), null, { params: { status } }),
  getEnrollments: (id) => apiClient.get(API_ENDPOINTS.CYCLES.ENROLLMENTS(id)),
};

export default cycleService;
