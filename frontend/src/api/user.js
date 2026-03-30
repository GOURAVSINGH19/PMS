import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

export const userService = {
  getAll: () => apiClient.get(API_ENDPOINTS.USERS.BASE),
  getById: (id) => apiClient.get(API_ENDPOINTS.USERS.BY_ID(id)),
  create: (data) => apiClient.post(API_ENDPOINTS.USERS.BASE, data),
  update: (id, data) => apiClient.patch(API_ENDPOINTS.USERS.BY_ID(id), data),
  delete: (id) => apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id))
};

export default userService;
