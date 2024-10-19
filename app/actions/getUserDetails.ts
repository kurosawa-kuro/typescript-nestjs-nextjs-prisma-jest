'use server'

import { getUserDetails as fetchUserDetails } from '@/lib/api'; // Assume this is your server-side API function
import { UserDetails } from '@/types/models';

export async function getUserDetails(id: number): Promise<UserDetails | null> {
  try {
    const userDetails = await fetchUserDetails(id);
    return userDetails;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}
