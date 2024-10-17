import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/models';
import { ApiService } from '../services/apiService';

export const useAuthStore = create<AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await ApiService.login(email, password);
          localStorage.setItem('token', token);
          set({ isLoggedIn: true, user, isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return false;
        }
      },

      logout: async () => {
        try {
          await ApiService.logout();
          localStorage.removeItem('token');
          set({ isLoggedIn: false, user: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);