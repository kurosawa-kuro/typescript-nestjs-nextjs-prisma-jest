import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthState, User, ApiError } from '../types/models';
import { ApiService } from '../services/apiService';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      loginStatus: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await ApiService.login(email, password);
          set({
            isLoggedIn: true,
            user: response.user,
            loginStatus: 'Login successful',
            isLoading: false,
            error: null
          });
          return true;
        } catch (error) {
          set({
            isLoggedIn: false,
            user: null,
            loginStatus: 'Login failed',
            isLoading: false,
            error:  'Login failed'
          });
          return false;
        }
      },

      logout: () => {
        // ここでログアウトAPIを呼び出す処理を追加する可能性があります
        set({
          isLoggedIn: false,
          user: null,
          loginStatus: 'Logged out',
          isLoading: false,
          error: null
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await ApiService.getUserProfile();
          set({
            isLoggedIn: true,
            user: user,
            loginStatus: 'Auth initialized',
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoggedIn: false,
            user: null,
            loginStatus: 'Auth initialization failed',
            isLoading: false,
            error: null
          });
        }
      },

      // 永続化されたデータを使用してユーザー状態を復元するメソッド
      restoreUserSession: () => {
        const state = get();
        console.log("state",state);
        if (state.isLoggedIn && state.user) {
          // 必要に応じて、ここでトークンの有効性を確認するなどの処理を追加できます
          return true;
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isLoggedIn: state.isLoggedIn, 
        user: state.user 
      }),
    }
  )
);
