import { cookies } from 'next/headers';
import { ApiClient } from '../../services/apiClient';
import { User } from '../../types/models';

export async function getUserProfile(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('jwt')?.value;

    if (!token) {
      return null;
    }

    const user = await ApiClient.get<User>('/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("getUserProfile user", user);
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
