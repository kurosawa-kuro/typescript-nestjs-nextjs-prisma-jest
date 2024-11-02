'use server';

import { Category } from '@/types/micropost';
import { ApiClient } from '@/services/apiClient';
import { cookies } from 'next/headers';

function getAuthHeaders(): Record<string, string> {
  const token = cookies().get('jwt')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await ApiClient.get<Category[]>('/categories', {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
