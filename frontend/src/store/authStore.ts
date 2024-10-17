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
      user: null,
      isLoading: false,
      error: null,
      flashMessage: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.login(email, password);
          set({ user: response.user, isLoading: false, flashMessage: 'Login successful!' });
          return response;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return null;
        }
      },

      logout: async () => {
        try {
          await ApiService.logout();
          set({ user: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setFlashMessage: (message) => set({ flashMessage: message }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
