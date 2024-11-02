import { Micropost, NewMicropost, Comment, Category } from '@/types/micropost';
import { LoginResponse, UserDetails } from '../types/user';
import { ApiClient } from './apiClient';

export const ClientSideApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: () => ApiClient.get<UserDetails>('/auth/me'),

  updateAvatar: (userId: number, formData: FormData) => 
    ApiClient.put<UserDetails>(`/users/${userId}/avatar`, formData, {
      rawBody: true,
    }),

  updateUserProfile: (userId: number, updatedFields: Partial<UserDetails>) => 
    ApiClient.put<UserDetails>(`/users/${userId}`, updatedFields),

  updateUserRole: (userId: number, isAdmin: boolean) => {
    const endpoint = isAdmin ? `/users/${userId}/admin` : `/users/${userId}/admin/remove`;
    return ApiClient.put<UserDetails>(endpoint, {});
  },

  followUser: (userId: number) => 
    ApiClient.post<UserDetails[]>(`/follow/${userId}`, {}),

  unfollowUser: (userId: number) => 
    ApiClient.delete<UserDetails[]>(`/follow/${userId}`),

  createMicroPost: (formData: FormData) => 
    ApiClient.post<NewMicropost>('/microposts', formData, {
      rawBody: true,
    }),

  createComment: (micropostId: number, content: string) =>
    ApiClient.post(`/microposts/${micropostId}/comments`, { content }),

  getComments: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/comments`),

  addLike: (micropostId: number) => 
    ApiClient.post(`/microposts/${micropostId}/likes`, {}),

  removeLike: (micropostId: number) => 
    ApiClient.delete(`/microposts/${micropostId}/likes`),

  getLikeStatus: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/likes`),

  getMicropostDetails: (micropostId: number) => 
    ApiClient.get(`/microposts/${micropostId}`),

  addMicropostView: async (micropostId: number) => {
    try {
      const response = await ApiClient.post(`/micropost-views/${micropostId}`, {});
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes('P2002')) {
        return { success: true, message: 'View already recorded' };
      }
      throw error;
    }
  },

  getCategories: () => ApiClient.get<Category[]>('/categories'),

  createCategory: (name: string) => 
    ApiClient.post<Category>('/categories', { name }),
};
