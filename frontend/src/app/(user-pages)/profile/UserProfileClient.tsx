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
import { FlashMessage } from '@/components/common/FlashMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { Micropost } from '@/types/micropost';
import Image from 'next/image';

interface UserProfileClientProps {
  initialUserDetails: UserDetails;
  initialMicroposts: Micropost[];
}

export default function UserProfileClient({ 
  initialUserDetails, 
  initialMicroposts 
}: UserProfileClientProps) {
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
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6">
            <AvatarSection
              user={user}
              fileInputRef={fileInputRef}
              handleAvatarClick={handleAvatarClick}
              handleAvatarChange={handleAvatarChange}
              isEditable={true}
            />
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
                <>
                  <ProfileDisplay 
                    user={user} 
                    handleEdit={handleEdit}
                    showEditButton={true}
                  />
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
                </>
              )}
            </div>
          </div>

          <div className="p-6 border-l">
            <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {initialMicroposts.map((post) => (
                <Link 
                  href={`/microposts/${post.id}`} 
                  key={post.id}
                  className="block hover:bg-gray-50 transition-colors duration-200 rounded-lg p-4 border"
                >
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <Image
                        src={`http://localhost:3001/uploads/${post.imagePath}`}
                        alt={post.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>💬 {post.comments.length}</span>
                        <span>❤️ {post.likesCount}</span>
                        <span>👁️ {post.viewsCount}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.categories.map((category) => (
                          <span 
                            key={category.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {flashMessage && <FlashMessage message={flashMessage} />}
    </div>
  );
}

function ProfileDisplay({ user, handleEdit, showEditButton }: { 
  user: UserDetails; 
  handleEdit?: () => void;
  showEditButton?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <ProfileItem label="User ID" value={user.id.toString()} />
        <ProfileItem label="Name" value={user.name} />
        <ProfileItem label="Email" value={user.email} />
        <ProfileItem label="Created At" value={new Date(user.createdAt).toLocaleDateString()} />
        <ProfileItem label="Updated At" value={new Date(user.updatedAt).toLocaleDateString()} />
      </div>
      {showEditButton && (
        <button
          onClick={handleEdit}
          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          Edit Profile
        </button>
      )}
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
