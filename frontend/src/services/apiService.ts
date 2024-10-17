import { LoginResponse, User } from '../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return ApiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  logout: async (): Promise<void> => {
    return ApiClient.post('/auth/logout', {});
  },

  me: async (token: string): Promise<User> => {
    console.log("ApiService me");
    const response = await ApiClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      useNoStore: true, // キャッシュを無効化
    }); 
    console.log("ApiService me response", response);
    return response;
  },
}
