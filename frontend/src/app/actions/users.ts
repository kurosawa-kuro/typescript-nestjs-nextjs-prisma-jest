'use server';

import {  UserDetails, UserInfo } from '@/types/models';
import { ApiClient } from '@/services/apiClient';
// Import the cookies function from next/headers
import { cookies } from 'next/headers';


export async function getUsers(): Promise<UserInfo[]> {
  return ApiClient.get<UserInfo[]>('/users');
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    const token = cookies().get('jwt')?.value;
    
    const response = await ApiClient.get<UserDetails>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
