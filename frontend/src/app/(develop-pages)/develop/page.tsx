// src/app/demo-login/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DevelopPage() {
  const router = useRouter();
  const { login, logout, isLoading, error } = useAuthStore();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<string>('');

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsedAuthStorage = JSON.parse(authStorage);
        // version を除外
        const { version, ...relevantData } = parsedAuthStorage;
        setStorageInfo(JSON.stringify(relevantData, null, 2));
      } catch (error) {
        setStorageInfo('Error parsing auth-storage');
      }
    } else {
      setStorageInfo('auth-storage not found');
    }
  };

  const handleDemoLogin = async (isAdmin: boolean) => {
    setLoginStatus('ログイン中...');
    const email = isAdmin ? 'admin@example.com' : 'alice@example.com';
    const password = 'password';

    const success = await login(email, password);

    if (success) {
      setLoginStatus('ログイン成功！リダイレクトします...');
      updateStorageInfo(); // ログイン後にストレージ情報を更新
      const { user } = useAuthStore.getState();
      if (user) {
        router.push(user.isAdmin ? '/admin' : '/profile');
      }
    } else {
      setLoginStatus('ログインに失敗しました。');
    }
  };

  const handleClearAllData = () => {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    updateStorageInfo();
    setLoginStatus('全てのデータがクリアされました。');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-grow p-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
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
          <h2 className="text-xl font-bold mt-8 mb-2">ローカルストレージ情報</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-sm whitespace-pre-wrap break-words">
            {storageInfo}
          </pre>
        </div>
      </div>
    </div>
  );
}
