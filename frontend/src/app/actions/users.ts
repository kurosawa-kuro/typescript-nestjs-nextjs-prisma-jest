'use server';

import { UserDetails, UserInfo } from '@/types/models';
import { ApiClient } from '@/services/apiClient';
// Import the cookies function from next/headers
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

export async function getUsers(): Promise<UserDetails[]> {
  return ApiClient.get<UserDetails[]>('/users', {
    headers: getAuthHeaders(),
  });
}

export async function getUsersWithFollowStatus(): Promise<UserDetails[]> {
  return ApiClient.get<UserDetails[]>('/users/with-follow-status', {
    headers: getAuthHeaders(),
  });
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    const response = await ApiClient.get<UserDetails>(`/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
