import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

const notificationService = {
  getAll: () => apiClient.get(API_ENDPOINTS.NOTIFICATIONS.BASE),
  markRead: (id) => apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  markAllRead: () => apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL),
  getUnreadCount: () => apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
};

export default notificationService;
