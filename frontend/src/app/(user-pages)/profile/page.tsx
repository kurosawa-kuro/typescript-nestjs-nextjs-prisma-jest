'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useLayoutEffect } from 'react';

export default function UserPages() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
    console.log("user", user);
    console.log("user?.isAdmin", user?.isAdmin);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold mb-4 text-black">User Profile</h1>
      <div className="mb-4 text-black">
        <p>Name: <span className="inline-block w-32">{isLoading ? '\u00A0' : user?.name}</span></p>
        <p>Email: <span className="inline-block w-32">{isLoading ? '\u00A0' : user?.email}</span></p>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Logout
      </button>
    </div>
  );
}

