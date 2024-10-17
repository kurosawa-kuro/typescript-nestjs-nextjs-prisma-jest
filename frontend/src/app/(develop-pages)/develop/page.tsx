// src/app/demo-login/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DevelopPage() {
  const router = useRouter();
  const { login, logout, isLoading, error } = useAuthStore();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const handleDemoLogin = async (isAdmin: boolean) => {
    setLoginStatus('ログイン中...');
    const email = isAdmin ? 'admin@example.com' : 'alice@example.com';
    const password = 'password';

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

  const handleClearAllData = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    setLoginStatus('全てのデータがクリアされました。');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">開発ツール</h1>
        <button
          onClick={() => handleDemoLogin(false)}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mb-4"
          disabled={isLoading}
        >
          デモユーザーでログイン
        </button>
        <button
          onClick={() => handleDemoLogin(true)}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 mb-4"
          disabled={isLoading}
        >
          デモ管理者でログイン
        </button>
        <button
          onClick={handleClearAllData}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
        >
          全データを削除
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
