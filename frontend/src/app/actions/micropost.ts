'use server';

import { Micropost } from '@/types/micropost'; 
import { ApiClient } from '@/services/apiClient';
import { cookies } from 'next/headers';
import { Comment } from '@/types/micropost';

// Helper function to get the JWT token
function getAuthToken(): string | undefined {
  return cookies().get('jwt')?.value;
}

// Helper function to create headers with authorization
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getMicroposts(searchQuery?: string): Promise<Micropost[]> {
  console.log('Search Query:', searchQuery);
  try {
    const response = await ApiClient.get<Micropost[]>('/microposts', {
      headers: getAuthHeaders(),
      params: { search: searchQuery },
    });
    return response;
  } catch (error) {
    console.error('Error fetching microposts:', error);
    throw error;
  }
}

export async function getMicropostDetails(id: number): Promise<Micropost | null> {
  try {
    const response = await ApiClient.get<Micropost>(`/microposts/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error(`Error fetching micropost details for id ${id}:`, error);
    return null;
  }
}

export async function getMicropostComments(micropostId: number): Promise<Comment[]> {
  try {
    const response = await ApiClient.get<Comment[]>(`/microposts/${micropostId}/comments`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error(`Error fetching comments for micropost ${micropostId}:`, error);
    return [];
  }
}

export async function getMicropostRanking(): Promise<Micropost[]> {
  try {
    const response = await ApiClient.get<Micropost[]>('/admin/ranking', {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error('Error fetching micropost ranking:', error);
    return [];
  }
}
