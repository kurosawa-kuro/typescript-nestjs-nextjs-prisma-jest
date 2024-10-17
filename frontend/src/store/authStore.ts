import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginResponse } from '../types/models';
import { ClientSideApiService } from '../services/ClientSideApiService';



export const useAuthStore = create<AuthState & {
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
  clearStorage?: () => void;
}>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      flashMessage: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ClientSideApiService.login(email, password);
          set({ user: response.user, isLoading: false, flashMessage: 'Login successful!' });
          return response;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return null;
        }
      },

      logout: async () => {
        try {
          await ClientSideApiService.logout();
          set({ user: null, error: null, flashMessage: null });
          
          localStorage.removeItem('auth-storage');
          
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          
          useAuthStore.persist.clearStorage();
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      setFlashMessage: (message) => set({ flashMessage: message }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
