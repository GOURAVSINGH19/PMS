import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: (() => {
    const user = localStorage.getItem('user');
    return user && user !== 'undefined' ? JSON.parse(user) : null;
  })(),
  token: localStorage.getItem('token'),
  
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
  
  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'admin';
  },
  
  isManager: () => {
    const state = useAuthStore.getState();
    return state.user?.role === 'manager' || state.user?.role === 'admin';
  }
}));
