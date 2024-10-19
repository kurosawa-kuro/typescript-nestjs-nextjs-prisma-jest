'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserDetails } from '@/types/models';
import Image from 'next/image';

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails }) {
  const router = useRouter();
  const { user, isLoading, getUserDetails } = useAuthStore();
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  const [userDetails, setUserDetails] = useState<UserDetails>(initialUserDetails);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center">
          <Image 
            src={`http://localhost:3001/uploads/${userDetails.avatarPath}`}
            alt="User Avatar"
            width={120}
            height={120}
            className="rounded-full border-4 border-white mx-auto"
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-4">User Profile</h1>
          <div className="space-y-3">
            <ProfileItem label="Name" value={userDetails.name} />
            <ProfileItem label="Email" value={userDetails.email} />
            <ProfileItem label="Created At" value={new Date(userDetails.createdAt).toLocaleDateString()} />
            <ProfileItem label="Updated At" value={new Date(userDetails.updatedAt).toLocaleDateString()} />
          </div>
        </div>
      </div>
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