import { LoginResponse, TokenUser, UserDetails } from '../types/models';
import { ApiClient } from './apiClient';

export const ClientSideApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: (token: string) => ApiClient.get<TokenUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  getUserDetails: (userId: number) => ApiClient.get<UserDetails>(`/users/${userId}`),
};
