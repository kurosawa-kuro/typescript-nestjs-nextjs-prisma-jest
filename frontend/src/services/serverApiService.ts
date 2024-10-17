import {  User } from '../types/models';
import { ApiClient } from './apiClient';

export const ServerApiService = {

  // 新しく追加された getUsers 関数
  getUsers: () => ApiClient.get<User[]>('/users'),
};
