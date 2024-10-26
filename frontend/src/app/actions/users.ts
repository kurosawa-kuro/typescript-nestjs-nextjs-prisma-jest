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

export async function followUser(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.post<UserDetails[]>(`/users/${userId}/follow`, {}, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.delete<UserDetails[]>(`/users/${userId}/follow`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function getFollowers(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.get<UserDetails[]>(`/users/${userId}/followers`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
}

export async function getFollowing(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.get<UserDetails[]>(`/users/${userId}/following`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching following users:', error);
    throw error;
  }
}
