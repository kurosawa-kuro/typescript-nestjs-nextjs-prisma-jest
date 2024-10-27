"use client"

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function SideBar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-800 text-white w-64 h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-6 text-center">
        My Application
      </div>
      <ul className="space-y-2 flex-grow overflow-y-auto">
        <li>
          <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">Public</Link>
        </li>
        {user && (
          <>
            <li>
              <Link href="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">Profile</Link>
            </li>
            <li>
              <Link href="/timeline" className="block py-2 px-4 hover:bg-gray-700 rounded">Timeline</Link>
            </li>
            <li>
              <Link href="/users" className="block py-2 px-4 hover:bg-gray-700 rounded">Users</Link>
            </li>
          </>
        )}
        {user?.userRoles.includes('admin') && (
          <li>
            <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">Admin</Link>
          </li>
        )}
        {!user && (
          <>
            <li>
              <Link href="/login" className="block py-2 px-4 hover:bg-gray-700 rounded">Login</Link>
            </li>
            <li>
              <Link href="/register" className="block py-2 px-4 hover:bg-gray-700 rounded">Register</Link>
            </li>
          </>
        )}
      </ul>
      {user && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-center mb-2">{user.name}</div>
          <button 
            onClick={logout} 
            className="block w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
