'use server';

import { UserDetails } from '@/types/user';
import { ApiClient } from '@/services/apiClient';

export async function getUsers(): Promise<UserDetails[]> {
  return ApiClient.get<UserDetails[]>('/users');
}

export async function getUsersWithFollowStatus(): Promise<UserDetails[]> {
  return ApiClient.get<UserDetails[]>('/users/with-follow-status');
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    const response = await ApiClient.get<UserDetails>(`/users/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

export async function followUser(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.post<UserDetails[]>(`/users/${userId}/follow`, {});
    return response;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.delete<UserDetails[]>(`/users/${userId}/follow`);
    return response;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function getFollowers(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.get<UserDetails[]>(`/users/${userId}/followers`);
    return response;
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
}

export async function getFollowing(userId: number): Promise<UserDetails[]> {
  try {
    const response = await ApiClient.get<UserDetails[]>(`/users/${userId}/following`);
    return response;
  } catch (error) {
    console.error('Error fetching following users:', error);
    throw error;
  }
}

export async function getMe(): Promise<UserDetails | null> {
  try {
    const response = await ApiClient.get<UserDetails>('/auth/me');
    return response;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
