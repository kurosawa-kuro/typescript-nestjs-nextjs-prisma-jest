'use server';

import { Micropost, MostViewRanking, Comment, CategoryRanking } from '@/types/micropost'; 
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

export const getMicroposts = (searchQuery?: string) =>
  handleRequest(
    () => ApiClient.get<Micropost[]>('/microposts', {
      params: { search: searchQuery },
    }),
    'Error fetching microposts'
  );

export const getMicropostDetails = (id: number) =>
  handleRequest(
    () => ApiClient.get<Micropost>(`/microposts/${id}`),
    `Error fetching micropost details for id ${id}`,
    null
  );

export const getMicropostComments = (micropostId: number) =>
  handleRequest(
    () => ApiClient.get<Comment[]>(`/microposts/${micropostId}/comments`),
    `Error fetching comments for micropost ${micropostId}`,
    []
  );

export const getMicropostRanking = () =>
  handleRequest(
    () => ApiClient.get<Micropost[]>('/admin/ranking'),
    'Error fetching micropost ranking',
    []
  );

export const getCategoryRanking = () =>
  handleRequest(
    () => ApiClient.get<CategoryRanking[]>('/admin/ranking/category'),
    'Error fetching category ranking',
    []
  );

export const getMostViewRanking = () =>
  handleRequest(
    () => ApiClient.get<MostViewRanking[]>('/admin/ranking/most-view'),
    'Error fetching most view ranking',
    []
  );
