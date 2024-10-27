'use server';

import { Micropost } from '@/types/models';
import { ApiClient } from '@/services/apiClient';
import { cookies } from 'next/headers';

// Helper function to get the JWT token
function getAuthToken(): string | undefined {
  return cookies().get('jwt')?.value;
}

// Helper function to create headers with authorization
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMicroposts(): Promise<Micropost[]> {
  try {
    const response = await ApiClient.get<Micropost[]>('/microposts', {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching microposts:', error);
    throw error;
  }
}
