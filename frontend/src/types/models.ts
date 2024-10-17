export interface User {
  id: string;
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
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;

}

export interface ApiError extends Error {
  statusCode?: number;
}
