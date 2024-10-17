// src/app/demo-login/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DevelopPage() {
  const router = useRouter();
  const { login, logout, isLoading, error, user, flashMessage } = useAuthStore();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<string>('');
  const [zustandInfo, setZustandInfo] = useState<string>('');

  const updateStorageInfo = useCallback(() => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsedAuthStorage = JSON.parse(authStorage);
        const { state } = parsedAuthStorage; // version を除外
        setStorageInfo(JSON.stringify({ state }, null, 2));
      } catch (error) {
        setStorageInfo('Error parsing auth-storage');
      }
    } else {
      setStorageInfo('auth-storage not found');
    }
  }, []);

  const updateZustandInfo = useCallback(() => {
    const zustandState = {
      user,
      isLoading,
      error,
      flashMessage
    };
    setZustandInfo(JSON.stringify(zustandState, null, 2));
  }, [user, isLoading, error, flashMessage]);

  useEffect(() => {
    updateStorageInfo();
    updateZustandInfo();
  }, [user, isLoading, error, flashMessage, updateStorageInfo, updateZustandInfo]);

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <h1 className=" font-bold p-6 bg-gray-800 text-white text-center">開発ツール</h1>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => handleDemoLogin(false)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
              disabled={isLoading}
            >
              デモユーザーでログイン
            </button>
            <button
              onClick={() => handleDemoLogin(true)}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
              disabled={isLoading}
            >
              デモ管理者でログイン
            </button>
            <button
              onClick={handleClearAllData}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
            >
              全データを削除
            </button>
          </div>
          {loginStatus && (
            <p className="text-center text-sm text-gray-600 mb-4">{loginStatus}</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-600 mb-4">{error}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold mb-2 p-3 bg-blue-100 border-b border-gray-300">Zustand 状態</h2>
              <pre className="bg-white p-4 overflow-auto h-80 text-sm whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {zustandInfo}
              </pre>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <h2 className="text-xl font-bold mb-2 p-3 bg-green-100 border-b border-gray-300">ローカルストレージ情報</h2>
              <pre className="bg-white p-4 overflow-auto h-80 text-sm whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                {storageInfo}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
