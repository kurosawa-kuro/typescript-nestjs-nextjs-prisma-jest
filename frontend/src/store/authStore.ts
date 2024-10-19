import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginResponse, TokenUser, UserDetails } from '../types/models';
import { ClientSideApiService } from '../services/ClientSideApiService';
import { useFlashMessageStore } from './flashMessageStore';
import { getUserDetails as getUserDetailsAction } from '@/app/actions/users';

const initialState: Omit<AuthState, 'resetStore' | 'login' | 'logout'> = {
  user: null,
  isLoading: false,
  error: null,
  getUserDetails: async () => null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      resetStore: () => set(initialState),
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ClientSideApiService.login(email, password);
          set({ user: response.user, isLoading: false });
          useFlashMessageStore.getState().setFlashMessage('Login successful!');
          return response;
        } catch (error) {
          set({ isLoading: false, error: 'Login failed' });
          return null;
        }
      },
      logout: async () => {
        try {
          await ClientSideApiService.logout();
          get().resetStore();
          clearAuthData();
          useFlashMessageStore.getState().setFlashMessage('Logged out successfully');
          window.location.href = '/';
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      setUser: (user: TokenUser | null) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      getUserDetails: async (id: number) => {
        try {
          const response = await getUserDetailsAction(id);
          if (response) {
            const userDetails: UserDetails = {
              id: Number(response.id),
              name: response.name,
              email: response.email,
              isAdmin: response.isAdmin,
              avatarPath: response.avatarPath || null,
              createdAt: response.createdAt || new Date().toISOString(),
              updatedAt: response.updatedAt || new Date().toISOString(),
            };
            return userDetails;
          }
          return null;
        } catch (error) {
          console.error('Error fetching user details:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

function clearAuthData() {
  localStorage.removeItem('auth-storage');
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  useAuthStore.persist.clearStorage();
}
