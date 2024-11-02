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

// カテゴリー詳細用の型定義
interface CategoryDetail extends Category {
  microposts: {
    id: number;
    title: string;
    imagePath: string;
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    viewsCount: number;
    isLiked: boolean;
    user: {
      id: number;
      name: string;
      profile: {
        avatarPath: string;
      };
    };
  }[];
}

export async function getCategoryDetail(id: number): Promise<CategoryDetail | null> {
  try {
    const response = await ApiClient.get<CategoryDetail>(`/categories/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  } catch (error) {
    console.error(`Error fetching category detail for id ${id}:`, error);
    return null;
  }
}
