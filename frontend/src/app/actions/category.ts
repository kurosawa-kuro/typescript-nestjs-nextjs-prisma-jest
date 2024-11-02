'use server';

import { Category, CategoryDetail } from '@/types/micropost';
import { ApiClient } from '@/services/apiClient';

// エラーハンドリング用のヘルパー関数
async function handleRequest<T>(
  requestFn: () => Promise<T>,
  errorMessage: string,
  defaultValue: T
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    console.error(errorMessage, error);
    return defaultValue;
  }
}

export async function getCategories(): Promise<Category[]> {
  return handleRequest(
    () => ApiClient.get<Category[]>('/categories'),
    'Error fetching categories',
    []
  );
}

export async function getCategoryDetail(id: number): Promise<CategoryDetail | null> {
  return handleRequest(
    () => ApiClient.get<CategoryDetail>(`/categories/${id}`),
    `Error fetching category detail for id ${id}`,
    null
  );
}
