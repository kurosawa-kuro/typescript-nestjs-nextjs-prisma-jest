import { Micropost, NewMicropost,Comment, Category } from '@/types/micropost';
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

  createComment: (micropostId: number, content: string) =>
    ApiClient.post(`/microposts/${micropostId}/comments`, { content }),

  getComments: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/comments`),

  addLike: async (micropostId: number) => {
    const response = await ApiClient.post(`/microposts/${micropostId}/likes`, {});
    return response;
  },

  removeLike: async (micropostId: number) => {
    const response = await ApiClient.delete(`/microposts/${micropostId}/likes`);
    return response;
  },

  getLikeStatus: (micropostId: number) =>
    ApiClient.get(`/microposts/${micropostId}/likes`),

  getMicropostDetails: async (micropostId: number) => {
    const response = await ApiClient.get(`/microposts/${micropostId}`);
    return response;
  },

  addMicropostView: async (micropostId: number) => {
    try {
      const response = await ApiClient.post(`/micropost-views/${micropostId}`, {});
      return response;
    } catch (error) {
      // P2002 は一意性制約違反のエラーコード
      // このエラーは既にビューが記録されている正常なケース
      if (error instanceof Error && error.message.includes('P2002')) {
        return { success: true, message: 'View already recorded' };
      }
      // その他のエラーは再スロー
      throw error;
    }
  },

  getCategories: () => ApiClient.get<Category[]>('/categories'),

  createCategory: (name: string) => ApiClient.post<Category>('/categories', { name: name }),
};
