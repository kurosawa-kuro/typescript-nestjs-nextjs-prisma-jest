import { LoginResponse, User } from '../types/models';
import { ApiClient } from './apiClient';

export const ApiService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return ApiClient.post<LoginResponse>('/auth/login', { email, password });
  },

  logout: async (): Promise<void> => {
    return ApiClient.post('/auth/logout', {});
  },

  // getUserProfile: async (): Promise<User> => {
  //   console.log("ApiService getUserProfile");
  //   return ApiClient.get<User>('/auth/me', {
  //     headers: {
  //       Authorization: 'Bearer ' + localStorage.getItem('token'), // Adjust as needed
  //       'Content-Type': 'application/json'
  //     }
  //   });
  // }
};
