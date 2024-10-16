// src/app/types/models.ts

export interface User {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean; 
    avatar_path: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
  }
  
  export interface AsyncOperationState {
    isLoading: boolean;
    error: string | null;
  }
  
  
  export interface AuthState extends AsyncOperationState {
    isLoggedIn: boolean;
    user: User | null;
    loginStatus: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    initializeAuth: () => Promise<void>;
  }
  
  
  // 追加された ApiError インターフェース
  export interface ApiError extends Error {
    statusCode?: number;
  }
  
  