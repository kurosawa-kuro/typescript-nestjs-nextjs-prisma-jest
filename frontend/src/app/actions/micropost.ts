'use server';

import { Micropost, MostViewRanking, Comment } from '@/types/micropost'; 
import { ApiClient } from '@/services/apiClient';

export async function getMicroposts(searchQuery?: string): Promise<Micropost[]> {
  try {
    const response = await ApiClient.get<Micropost[]>('/microposts', {
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
    const response = await ApiClient.get<Micropost>(`/microposts/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching micropost details for id ${id}:`, error);
    return null;
  }
}

export async function getMicropostComments(micropostId: number): Promise<Comment[]> {
  try {
    const response = await ApiClient.get<Comment[]>(`/microposts/${micropostId}/comments`);
    return response;
  } catch (error) {
    console.error(`Error fetching comments for micropost ${micropostId}:`, error);
    return [];
  }
}

export async function getMicropostRanking(): Promise<Micropost[]> {
  try {
    const response = await ApiClient.get<Micropost[]>('/admin/ranking');
    return response;
  } catch (error) {
    console.error('Error fetching micropost ranking:', error);
    return [];
  }
}

export async function getCategoryRanking() {
  try {
    const response = await ApiClient.get('/admin/ranking/category');
    return response;
  } catch (error) {
    console.error('Error fetching category ranking:', error);
    return [];
  }
}

export async function getMostViewRanking(): Promise<MostViewRanking[]> {
  try {
    const response = await ApiClient.get<MostViewRanking[]>('/admin/ranking/most-view');
    return response;
  } catch (error) {
    console.error('Error fetching most view ranking:', error);
    return [];
  }
}
