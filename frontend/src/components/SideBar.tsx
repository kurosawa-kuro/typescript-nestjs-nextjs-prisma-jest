 "use client"

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Navigation() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <ul className="space-y-2">
        <li>
          <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">Public</Link>
        </li>
        {user && (
          <li>
            <Link href="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">Profile</Link>
          </li>
        )}
        {user?.isAdmin && (
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
        {user && (
          <li>
            <button onClick={logout} className="block w-full text-left py-2 px-4 hover:bg-gray-700 rounded">Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
}
