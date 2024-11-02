'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserDetails } from '@/types/user';
import { useUserProfileStore } from '@/store/userProfileStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

// Add this custom hook at the top of the file
function useCurrentUser(): CurrentUser {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  useEffect(() => {
    const userData = document.cookie.split('; ')
      .find(row => row.startsWith('x-user-data='))
      ?.split('=')[1];
    if (userData) {
      setCurrentUser(JSON.parse(decodeURIComponent(userData)));
    }
  }, []);

  return currentUser;
}

// Add this type at the top of the file
type CurrentUser = { id: number } | null;

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails }) {
  const { user, setUser } = useUserProfileStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialUserDetails) {
      router.push('/login');
    } else {
      setUser(initialUserDetails);
    }
  }, [initialUserDetails, setUser, router]);

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full">
        <AvatarSection user={user} />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">User Profile</h1>
          <div className="space-y-3">
            <ProfileDisplay user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarSection({ user }: { user: UserDetails }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center relative">
      <div 
        className="relative inline-block group cursor-pointer"
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
    </div>
  );
}

function ProfileDisplay({ user }: { user: UserDetails }) {
  const currentUser = useCurrentUser();
  const isCurrentUser = currentUser?.id === user.id;

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
      {!isCurrentUser && <FollowButton userId={user.id} isFollowing={user.isFollowing ?? false} />}
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

function FollowButton({ userId, isFollowing }: { userId: number; isFollowing: boolean }) {
  const handleFollowAction = () => {
    console.log(`${isFollowing ? 'Unfollow' : 'Follow'} user with ID: ${userId}`);
    // Actual follow/unfollow logic will be implemented later
  };

  return (
    <button
      onClick={handleFollowAction}
      className={`w-full mt-4 py-2 px-4 rounded-md text-white transition-colors duration-200 ${
        isFollowing
          ? 'bg-rose-400 hover:bg-rose-500'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
