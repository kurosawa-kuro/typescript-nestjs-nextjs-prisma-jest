import { useRef } from 'react';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import { UserDetails } from '@/types/models';
import { useUserProfileStore } from '@/store/UserProfileStore';

export function useAvatarUpload(onSuccess: (message: string) => void, onError: (message: string) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useUserProfileStore();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleAvatarChange');
    const file = event.target.files?.[0];
    console.log('file', file);
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      console.log('try');
      console.log('user.id', user.id);
      console.log('formData', formData);
      const updatedUser = await ClientSideApiService.updateAvatar(user.id, formData);
      updateUser(updatedUser);
      onSuccess('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      onError('Failed to update avatar');
    }
  };

  return {
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange
  };
}
