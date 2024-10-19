'use server';

import { TokenUser, UserDetails } from '@/types/models';
import { ApiClient } from '@/services/apiClient';

export async function getUsers(): Promise<TokenUser[]> {
  return ApiClient.get<TokenUser[]>('/users');
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    return await ApiClient.get<UserDetails>(`/users/${id}`);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
