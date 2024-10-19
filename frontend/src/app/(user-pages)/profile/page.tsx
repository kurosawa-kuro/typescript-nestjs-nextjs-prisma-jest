'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserDetails } from '@/types/models';

export default function UserProfile() {
  const router = useRouter();
  const { user, isLoading, getUserDetails } = useAuthStore();
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.isAdmin) {
        router.push('/admin');
      } else {
        fetchUserDetails();
      }
    }
  }, [user, isLoading, router]);

  const fetchUserDetails = async () => {
    if (user && user.id) {
      const details = await getUserDetails(Number(user.id));
      if (details) {
        setUserDetails(details);
      }
    }
  };

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (isLoading || !userDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      {flashMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {flashMessage}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-black">User Profile</h1>
      <div className="mb-4 text-black">
        <p>Name: <span className="inline-block w-32">{userDetails.name}</span></p>
        <p>Email: <span className="inline-block w-32">{userDetails.email}</span></p>
        <p>Avatar: <span className="inline-block w-32">{userDetails.avatarPath || 'No avatar'}</span></p>
        <p>Created At: <span className="inline-block w-32">{new Date(userDetails.createdAt).toLocaleDateString()}</span></p>
        <p>Updated At: <span className="inline-block w-32">{new Date(userDetails.updatedAt).toLocaleDateString()}</span></p>
      </div>
    </div>
  );
}
