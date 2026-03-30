import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const cycleService = {
  getAll: () => apiClient.get(API_ENDPOINTS.CYCLES.BASE),
  getById: (id) => apiClient.get(API_ENDPOINTS.CYCLES.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.CYCLES.BASE, data),
  trigger: (id) => apiClient.post(API_ENDPOINTS.CYCLES.TRIGGER(id)),
  close: (id) => apiClient.post(API_ENDPOINTS.CYCLES.CLOSE(id)),
  getCompliance: (id) => apiClient.get(API_ENDPOINTS.CYCLES.COMPLIANCE(id)),
};

export default cycleService;
