'use server';

import { TokenUser } from '@/types/models';
import { ApiClient } from '@/services/apiClient';

export async function getUsers(): Promise<TokenUser[]> {
  return ApiClient.get<TokenUser[]>('/users');
}
