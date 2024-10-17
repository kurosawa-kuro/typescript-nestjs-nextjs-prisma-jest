export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar_path: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApiError extends Error {
  statusCode?: number;
}