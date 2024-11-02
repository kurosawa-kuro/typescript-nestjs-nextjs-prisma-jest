'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserDetails } from '@/types/user';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import { useUserProfileStore } from '@/store/UserProfileStore';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useProfileForm } from '@/hooks/useProfileForm';
import { AvatarSection } from '@/components/profile/AvatarSection';
import { EditForm } from '@/components/profile/EditForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { FlashMessage } from '@/components/common/FlashMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails }) {
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  const { user, setUser } = useUserProfileStore();
  const router = useRouter();

  const {
    isEditing,
    editedName,
    editedEmail,
    setEditedName,
    setEditedEmail,
    handleEdit,
    handleSave,
    handleCancel,
  } = useProfileForm(user, setFlashMessage);

  const { fileInputRef, handleAvatarClick, handleAvatarChange } = useAvatarUpload(
    (message) => setFlashMessage(message),
    (message) => setFlashMessage(message)
  );

  useEffect(() => {
    if (!initialUserDetails) {
      router.push('/login');
    } else {
      setUser(initialUserDetails);
    }
  }, [initialUserDetails, setUser, router]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFlashMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full">
        <AvatarSection
          user={user}
          fileInputRef={fileInputRef}
          handleAvatarClick={handleAvatarClick}
          handleAvatarChange={handleAvatarChange}
          isEditable={true}
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">User Profile</h1>
          <div className="space-y-3">
            {isEditing ? (
              <EditForm
                editedName={editedName}
                editedEmail={editedEmail}
                setEditedName={setEditedName}
                setEditedEmail={setEditedEmail}
                handleSave={handleSave}
                handleCancel={handleCancel}
              />
            ) : (
              <ProfileDisplay 
                user={user} 
                handleEdit={handleEdit}
                showEditButton={true}
              />
            )}
          </div>
        </div>
      </div>
      {flashMessage && <FlashMessage message={flashMessage} />}
    </div>
  );
}
