'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserDetails } from '@/types/user';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import { useUserProfileStore } from '@/store/UserProfileStore';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useUserProfileUpdate } from '@/hooks/useUserProfileUpdate';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails }) {
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  const { user, setUser, updateUser } = useUserProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const router = useRouter();

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

  const { fileInputRef, handleAvatarClick, handleAvatarChange } = useAvatarUpload(
    (message) => setFlashMessage(message),
    (message) => setFlashMessage(message)
  );

  const { updateUserProfile, isLoading: isLoadingUpdate } = useUserProfileUpdate(
    user,
    setFlashMessage,
    setFlashMessage
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
  };

  const handleSave = async () => {
    const updatedUser = await updateUserProfile({ name: editedName, email: editedEmail });
    if (updatedUser) {
      updateUser(updatedUser);
      setIsEditing(false);
      setFlashMessage('User profile updated successfully');
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setIsEditing(false);
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full">
        <AvatarSection
          user={user}
          fileInputRef={fileInputRef}
          handleAvatarClick={handleAvatarClick}
          handleAvatarChange={handleAvatarChange}
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
              <ProfileDisplay user={user} handleEdit={handleEdit} />
            )}
          </div>
        </div>
      </div>
      {flashMessage && <FlashMessage message={flashMessage} />}
    </div>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Error</h1>
        <p className="text-center">{error}</p>
      </div>
    </div>
  );
}

function AvatarSection({ user, fileInputRef, handleAvatarClick, handleAvatarChange }: {
  user: UserDetails;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleAvatarClick: () => void;
  handleAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center relative">
      <div 
        className="relative inline-block group cursor-pointer"
        onClick={handleAvatarClick}
      >
        <Image 
          src={`http://localhost:3001/uploads/${user.profile?.avatarPath}`}
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
  );
}

function EditForm({
  editedName,
  editedEmail,
  setEditedName,
  setEditedEmail,
  handleSave,
  handleCancel
}: {
  editedName: string;
  editedEmail: string;
  setEditedName: (name: string) => void;
  setEditedEmail: (email: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
}) {
  return (
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
  );
}

function ProfileDisplay({ user, handleEdit }: { user: UserDetails; handleEdit: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <ProfileItem label="User ID" value={user.id.toString()} />
        <ProfileItem label="Name" value={user.name} />
        <ProfileItem label="Email" value={user.email} />
        <ProfileItem label="Created At" value={new Date(user.createdAt).toLocaleDateString()} />
        <ProfileItem label="Updated At" value={new Date(user.updatedAt).toLocaleDateString()} />
      </div>
      <div className="flex justify-between items-center mt-6">
        <Link href={`/users/${user.id}/followers`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>Followers</span>
        </Link>
        <Link href={`/users/${user.id}/following`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span>Following</span>
        </Link>
      </div>
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleEdit} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="mt-1 text-sm text-gray-900">{value}</p>
    </div>
  );
}

function FlashMessage({ message }: { message: string }) {
  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded">
      {message}
    </div>
  );
}
