import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginResponse } from '../types/models';
import { ApiService } from '../services/apiService';

export const useAuthStore = create<AuthState & {
  login: (email: string, password: string) => Promise<LoginResponse | null>;
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
          const response = await ApiService.login(email, password);
          set({ isLoggedIn: true, user: response.user, isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return null;
        }
      },

      logout: async () => {
        try {
          await ApiService.logout();
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