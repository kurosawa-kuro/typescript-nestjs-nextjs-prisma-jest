import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/models';
import { ApiService } from '../services/apiService';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await ApiService.login(email, password);
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
          set({ isLoggedIn: false, user: null });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

    //   initializeAuth: async () => {
    //     console.log("initializeAuth");
    //     try {
    //       const user = await ApiService.getUserProfile();
    //       set({ isLoggedIn: true, user });
    //     } catch (error) {
    //       set({ isLoggedIn: false, user: null });
    //     }
    //   },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
);
