// src/app/demo-login/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DemoLoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoginStatus('ログイン中...');
    const email = 'alice@example.com'; // デモユーザーのメールアドレス
    const password = 'password'; // デモユーザーのパスワード

    const success = await login(email, password);

    if (success) {
      setLoginStatus('ログイン成功！リダイレクトします...');
      const { user } = useAuthStore.getState();
      if (user) {
        setTimeout(() => {
          router.push(user.isAdmin ? '/admin' : '/profile');
        }, 1500); // 1.5秒後にリダイレクト
      }
    } else {
      setLoginStatus('ログインに失敗しました。');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">デモログイン</h1>
        <button
          onClick={handleDemoLogin}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          disabled={isLoading}
        >
          デモユーザーでログイン
        </button>
        {loginStatus && (
          <p className="mt-4 text-center text-sm text-gray-600">{loginStatus}</p>
        )}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
