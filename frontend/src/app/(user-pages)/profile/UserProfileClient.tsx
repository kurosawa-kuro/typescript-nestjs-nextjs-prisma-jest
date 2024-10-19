'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserDetails } from '@/types/models';
import Image from 'next/image';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useUserProfileUpdate } from '@/hooks/useUserProfileUpdate';

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails }) {
  const router = useRouter();
  const { user: authUser, isLoading, error } = useAuthStore();
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  
  const {
    user,
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange
  } = useAvatarUpload(initialUserDetails, setFlashMessage, setFlashMessage);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);

  const { updateUserProfile } = useUserProfileUpdate(user, setFlashMessage, setFlashMessage, setEditedName, setEditedEmail);

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push('/login');
    }
  }, [authUser, isLoading, router]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updatedUser = await updateUserProfile({ name: editedName, email: editedEmail });
    setIsEditing(false);
    setFlashMessage('User profile updated successfully');
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Error</h1>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center relative">
          <div 
            className="relative inline-block group cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Image 
              src={`http://localhost:3001/uploads/${user.avatarPath}`}
              alt="User Avatar"
              width={120}
              height={120}
              className="rounded-full border-4 border-white mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm">Change Avatar</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">User Profile</h1>
          <div className="space-y-3">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                  <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <ProfileItem label="Name" value={user.name} />
                <ProfileItem label="Email" value={user.email} />
                <ProfileItem label="Created At" value={new Date(user.createdAt).toLocaleDateString()} />
                <ProfileItem label="Updated At" value={new Date(user.updatedAt).toLocaleDateString()} />
                <div className="flex justify-end mt-4">
                  <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {flashMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded">
          {flashMessage}
        </div>
      )}
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <span className="font-semibold text-gray-600">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
