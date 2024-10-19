import { LoginResponse, TokenUser, UserDetails } from '../types/models';
import { ApiClient } from './apiClient';

export const ClientSideApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: (token: string) => ApiClient.get<TokenUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),


  updateAvatar: (userId: number, formData: FormData) => 
    ApiClient.put<UserDetails>(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      rawBody: true,
    }),

  updateUserProfile: async (userId: number, updatedFields: Partial<UserDetails>) => {
    return ApiClient.put<UserDetails>(`/users/${userId}`, updatedFields);
  },
};
