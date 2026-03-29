import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const adminService = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getAutomationStatus: () => apiClient.get(API_ENDPOINTS.ADMIN.AUTOMATION),
  getStalledApprovals: () => apiClient.get(API_ENDPOINTS.ADMIN.STALLED),
  getAgingFlags: () => apiClient.get(API_ENDPOINTS.ADMIN.AGING_FLAGS),
  getNoManagerEmployees: () => apiClient.get(API_ENDPOINTS.ADMIN.NO_MANAGER),
  getCycleCompliance: (cycleId) => apiClient.get(API_ENDPOINTS.ADMIN.COMPLIANCE(cycleId)),
};

export default adminService;
