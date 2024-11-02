'use server';

import { UserDetails } from '@/types/user';
import { ApiClient } from '@/services/apiClient';

// エラーハンドリング用のヘルパー関数
async function handleRequest<T>(
  requestFn: () => Promise<T>,
  errorMessage: string,
  defaultValue?: T
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    console.error(errorMessage, error);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

export const getUsers = () => 
  handleRequest(
    () => ApiClient.get<UserDetails[]>('/users'),
    'Error fetching users',
    []
  );

export const getUsersWithFollowStatus = () => 
  handleRequest(
    () => ApiClient.get<UserDetails[]>('/users/with-follow-status'),
    'Error fetching users with follow status',
    []
  );

export const getUserDetails = (id: number) => 
  handleRequest(
    () => ApiClient.get<UserDetails>(`/users/${id}`),
    `Error fetching user details for id ${id}`,
    null
  );

export const followUser = (userId: number) => 
  handleRequest(
    () => ApiClient.post<UserDetails[]>(`/users/${userId}/follow`, {}),
    `Error following user ${userId}`
  );

export const unfollowUser = (userId: number) => 
  handleRequest(
    () => ApiClient.delete<UserDetails[]>(`/users/${userId}/follow`),
    `Error unfollowing user ${userId}`
  );

export const getFollowers = (userId: number) => 
  handleRequest(
    () => ApiClient.get<UserDetails[]>(`/users/${userId}/followers`),
    `Error fetching followers for user ${userId}`,
    []
  );

export const getFollowing = (userId: number) => 
  handleRequest(
    () => ApiClient.get<UserDetails[]>(`/users/${userId}/following`),
    `Error fetching following users for user ${userId}`,
    []
  );

export const getMe = () => 
  handleRequest(
    () => ApiClient.get<UserDetails>('/auth/me'),
    'Error fetching current user',
    null
  );
