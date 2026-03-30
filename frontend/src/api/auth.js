import apiClient from './apiClient';
import API_ENDPOINTS from './apiEndpoints';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
