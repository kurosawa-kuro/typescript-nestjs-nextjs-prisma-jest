import { LoginResponse, User } from '../types/models';
import { ApiClient } from './apiClient';
import { setCookie } from 'nookies';

export const ApiService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await ApiClient.post<LoginResponse>('/auth/login', { email, password });
    console.log("ApiService login response", response);
    if (!response || !response.token) {
      throw new Error('Login failed');
    }
    
    // トークンをクッキーに保存
    setCookie(null, 'jwt', response.token, {
      maxAge: 30 * 24 * 60 * 60, // 30日間有効
      path: '/',
      secure: process.env.NODE_ENV === 'production', // 本番環境では HTTPS のみ
      sameSite: 'strict'
    });

    return {
      success: true,
      message: 'Login successful',
      token: response.token,
      user: response.user
    };
  },

  getUserProfile: async (): Promise<User> => {
    const response = await ApiClient.get<User>('/auth/profile');
    if (!response) {
      throw new Error('Failed to get user profile');
    }
    return response;
  }
};
