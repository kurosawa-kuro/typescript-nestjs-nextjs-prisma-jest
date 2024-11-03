import React from 'react';
import Link from 'next/link';
import { Micropost } from '@/types/micropost';
import { FaEye, FaHeart } from 'react-icons/fa'; // アイコンをインポート

interface MicropostCardProps {
  micropost: Micropost & { likesCount: number };
}

const MicropostCard: React.FC<MicropostCardProps> = ({ micropost }) => {
  // 閲覧回数を表示
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <Link href={`/timeline/${micropost.id}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{micropost.title}</h2>

        <div className="mb-2 flex justify-center items-center h-[200px]">
          <img
            src={`http://localhost:3001/uploads/${micropost.imagePath}`}
            alt={micropost.title}
            className="max-w-full max-h-[200px] w-auto h-auto object-contain rounded"
          />
        </div>
        <div className="flex justify-between items-center text-gray-600 text-sm">
          <p>
            Posted by {micropost.user?.name || `User ${micropost.user?.id}`} on {new Date(micropost.createdAt).toLocaleDateString()}
          </p>
          <div className="flex gap-3">
            <span className="flex items-center">
              <FaHeart className="text-red-500 mr-1" /> {micropost.likesCount}
            </span>
            <span className="flex items-center">
              <FaEye className="text-blue-500 mr-1" /> {micropost.viewsCount}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MicropostCard;
