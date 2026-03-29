import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const probationService = {
  getAll: () => apiClient.get(API_ENDPOINTS.PROBATION.BASE),
  getMe: () => apiClient.get(API_ENDPOINTS.PROBATION.ME),
  getById: (id) => apiClient.get(API_ENDPOINTS.PROBATION.BY_ID(id)),
  startLeave: (id, data) => apiClient.post(`/probation/${id}/leave/start`, data),
  endLeave: (id) => apiClient.post(`/probation/${id}/leave/end`),
  waiveTrigger: (id, day, comment) => apiClient.post(`/probation/${id}/waive/${day}`, { comment }),
};

export default probationService;
