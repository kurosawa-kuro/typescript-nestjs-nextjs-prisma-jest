import { Micropost, NewMicropost } from '@/types/micropost';
import { LoginResponse, UserDetails } from '../types/user';
import { ApiClient } from './apiClient';



export const ClientSideApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: (token: string) => ApiClient.get<UserDetails>('/auth/me', {
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

  updateUserRole: async (userId: number, isAdmin: boolean) => {
    const endpoint = isAdmin ? `/users/${userId}/admin` : `/users/${userId}/admin/remove`;
    return ApiClient.put<UserDetails>(endpoint, {});
  },

  followUser: async (userId: number) => {
    return ApiClient.post<UserDetails[]>(`/follow/${userId}`, {});
  },

  unfollowUser: async (userId: number) => {
    return ApiClient.delete<UserDetails[]>(`/follow/${userId}`);
  },

  createPost: (formData: FormData) => 
    ApiClient.post<NewMicropost>('/microposts', formData, {
      rawBody: true,
    }),
};
