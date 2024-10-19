// TokenUserに変更したい
export interface TokenUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar_path: string;
}

export interface LoginResponse {
  token: string;
  user: TokenUser;
}

export interface AuthState {
  user: TokenUser | null;
  isLoading: boolean;
  error: string | null;
  resetStore: () => void;
  login: (email: string, password: string) => Promise<LoginResponse | null>;
  logout: () => Promise<void>;
}

export interface ApiError extends Error {
  statusCode?: number;
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  avatarPath: string | null;
  createdAt: string;
  updatedAt: string;
}
