'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useLayoutEffect } from 'react';

export default function AdminPages() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
    console.log("user", user);
    console.log("user?.isAdmin", user?.isAdmin);

    // 管理者でない場合はホームページにリダイレクト
    if (user && !user.isAdmin) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return null; // または適切なエラーメッセージを表示
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold mb-4 text-black">Admin Dashboard</h1>
      <div className="mb-4 text-black">
        <p>Name: <span className="inline-block w-32">{user.name}</span></p>
        <p>Email: <span className="inline-block w-32">{user.email}</span></p>
        <p>Role: <span className="inline-block w-32">Administrator</span></p>
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
