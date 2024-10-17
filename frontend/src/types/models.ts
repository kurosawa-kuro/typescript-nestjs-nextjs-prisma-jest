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
  flashMessage: string | null;
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
  setFlashMessage: (message: string | null) => void;
}

export interface ApiError extends Error {
  statusCode?: number;
}