import React from 'react';
import Link from 'next/link';

const DevelopSidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">開発メニュー</h2>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/develop" className="block py-2 px-4 hover:bg-gray-700 rounded">
              開発ホーム
            </Link>
          </li>
          <li>
            <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Admin
            </Link>
          </li>
          <li>
            <Link href="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/develop/api-test" className="block py-2 px-4 hover:bg-gray-700 rounded">
              API テスト
            </Link>
          </li>
          <li>
            <Link href="/develop/database" className="block py-2 px-4 hover:bg-gray-700 rounded">
              データベース管理
            </Link>
          </li>
          <li>
            <Link href="/develop/logs" className="block py-2 px-4 hover:bg-gray-700 rounded">
              ログ表示
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DevelopSidebar;
