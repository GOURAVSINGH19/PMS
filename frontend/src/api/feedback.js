import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

export const feedbackService = {
  getAll: () => apiClient.get(API_ENDPOINTS.FEEDBACK.BASE),
  getMyForms: () => apiClient.get(API_ENDPOINTS.FEEDBACK.BASE),
  getById: (id) => apiClient.get(API_ENDPOINTS.FEEDBACK.BY_ID(id)),
  submitForm: (id, data) => apiClient.post(API_ENDPOINTS.FEEDBACK.SUBMIT(id), data),
  getFlagQueue: (status) => apiClient.get(API_ENDPOINTS.FEEDBACK.FLAGS, { params: { status } }),
  updateFlag: (id, data) => apiClient.patch(API_ENDPOINTS.FEEDBACK.FLAG_DETAIL(id), data),
};

export default feedbackService;
