import React from 'react';
import Link from 'next/link';
import { Micropost } from '@/types/micropost';
import { FaHeart } from 'react-icons/fa'; // アイコンをインポート

interface MicropostCardProps {
  micropost: Micropost & { likesCount: number };
}

const MicropostCard: React.FC<MicropostCardProps> = ({ micropost }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <Link href={`/timeline/${micropost.id}`}>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{micropost.title}</h2>

        <div className="mb-2 flex justify-center items-center" style={{ maxHeight: '300px' }}>
          <img
            src={`http://localhost:3001/uploads/${micropost.imagePath}`}
            alt={micropost.title}
            className="max-w-full min-h-[300px] object-contain rounded"
          />
        </div>
        <div className="flex justify-between items-center text-gray-600 text-sm">
          <p>
            Posted by {micropost.user?.name || `User ${micropost.user?.id}`} on {new Date(micropost.createdAt).toLocaleDateString()}
          </p>
          <span className="flex items-center">
            <FaHeart className="text-red-500 mr-1" /> {micropost.likesCount}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default MicropostCard;
