'use server';

import { TokenUser, UserDetails } from '@/types/models';
import { ApiClient } from '@/services/apiClient';
// Import the cookies function from next/headers
import { cookies } from 'next/headers';


export async function getUsers(): Promise<TokenUser[]> {
  return ApiClient.get<TokenUser[]>('/users');
}

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    console.log('id in getUserDetails', id);
    // Assuming you have a function to get the token, e.g., from local storage
    // const token = localStorage.getItem('token');
    // Use the cookies function to get the jwt
    const token = cookies().get('jwt')?.value;
    
    console.log('token in getUserDetails', token);

    const response = await ApiClient.get<UserDetails>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('response', response);
    return response;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
