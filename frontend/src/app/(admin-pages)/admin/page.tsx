'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminPages() {
  const router = useRouter();
  const { user,  isLoading, flashMessage, setFlashMessage } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.isAdmin) {
        router.push('/profile');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000); // 5秒後にメッセージを消す
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      {flashMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {flashMessage}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-black">Admin Dashboard</h1>
      <div className="mb-4 text-black">
        <p>Name: <span className="inline-block w-32">{user.name}</span></p>
        <p>Email: <span className="inline-block w-32">{user.email}</span></p>
        <p>Role: <span className="inline-block w-32">Administrator</span></p>
      </div>
    </div>
  );
}
