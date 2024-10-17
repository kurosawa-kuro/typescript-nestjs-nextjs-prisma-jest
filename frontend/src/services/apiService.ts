import { LoginResponse, User } from '../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  login: (email: string, password: string) => 
    ApiClient.post<LoginResponse>('/auth/login', { email, password }),

  logout: () => ApiClient.post('/auth/logout', {}),

  me: (token: string) => ApiClient.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // 新しく追加された getUsers 関数
  getUsers: () => ApiClient.get<User[]>('/users'),
};
