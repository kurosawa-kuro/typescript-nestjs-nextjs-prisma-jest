import { useState, useRef } from 'react';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import { UserDetails } from '@/types/models';

export function useAvatarUpload(initialUser: UserDetails, onSuccess: (message: string) => void, onError: (message: string) => void) {
  const [user, setUser] = useState<UserDetails>(initialUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const updatedUser = await ClientSideApiService.updateAvatar(user.id, formData);
      setUser(updatedUser);
      onSuccess('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      onError('Failed to update avatar');
    }
  };

  return {
    user,
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange
  };
}
