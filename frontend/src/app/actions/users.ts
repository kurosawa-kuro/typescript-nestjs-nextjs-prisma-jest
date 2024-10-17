'use server';

import { User } from '@/types/models';
import { ApiClient } from '@/services/apiClient';

export async function getUsers(): Promise<User[]> {
  return ApiClient.get<User[]>('/users');
}
