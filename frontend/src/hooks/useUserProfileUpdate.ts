import { useState } from 'react';
import { UserDetails } from '@/types/models';
import { ClientSideApiService } from '@/services/ClientSideApiService';

export function useUserProfileUpdate(
  initialUser: UserDetails, 
  onSuccess: (message: string) => void, 
  onError: (message: string) => void,
  setEditedName: React.Dispatch<React.SetStateAction<string>>,
  setEditedEmail: React.Dispatch<React.SetStateAction<string>>,
) {
  const [isLoading, setIsLoading] = useState(false);

  const updateUserProfile = async (updatedFields: Partial<UserDetails>) => {
    setIsLoading(true);
    try {
      const updatedUser = await ClientSideApiService.updateUserProfile(initialUser.id, updatedFields);
      setEditedName(updatedUser.name);
      setEditedEmail(updatedUser.email);
      onSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      onError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    isLoading
  };
}
