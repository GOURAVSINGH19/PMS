import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const probationService = {
  getAll: () => apiClient.get(API_ENDPOINTS.PROBATION.BASE),
  getMe: (userId) => apiClient.get(API_ENDPOINTS.PROBATION.ME(userId)),
  getById: (id) => apiClient.get(API_ENDPOINTS.PROBATION.BY_ID(id)),
  pause: (id, data) => apiClient.post(`/probation/${id}/pause`, data),
  resume: (id) => apiClient.post(`/probation/${id}/resume`),
  complete: (id, data) => apiClient.post(`/probation/${id}/complete`, data),
  reject: (id, data) => apiClient.post(`/probation/${id}/reject`, data),
  submitTriggerFeedback: (triggerId, data) => apiClient.post(`/probation/triggers/${triggerId}/feedback`, data),
};

export default probationService;
