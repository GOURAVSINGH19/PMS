import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const adminService = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getAutomationStatus: () => apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getFlagsTriage: (status) => apiClient.get(API_ENDPOINTS.ADMIN.FLAGS_TRIAGE, { params: { status } }),
  getFlagsStats: () => apiClient.get(API_ENDPOINTS.ADMIN.FLAGS_STATS),
  getReportsGoals: () => apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_GOALS),
  getReportsProbation: () => apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_PROBATION),
  getReportsReviews: () => apiClient.get(API_ENDPOINTS.ADMIN.REPORTS_REVIEWS),
};

export default adminService;
