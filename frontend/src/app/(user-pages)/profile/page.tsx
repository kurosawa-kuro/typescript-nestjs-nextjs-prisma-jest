'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserPages() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        credentials: 'include', // 重要: クッキーを含める
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // ログアウト成功時にホームページにリダイレクト
      router.push('/');
    } catch (err) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4 bg-blue-500">User Profile</h1>
      <p className="mb-8 bg-blue-500">Welcome to your profile page!</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Logout
      </button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
