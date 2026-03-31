import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const dashboardService = {
  getMe: () => apiClient.get(API_ENDPOINTS.DASHBOARD.ME),
  getTeam: () => apiClient.get(API_ENDPOINTS.DASHBOARD.TEAM),
  getCompany: () => apiClient.get(API_ENDPOINTS.DASHBOARD.COMPANY),
};

export default dashboardService;
