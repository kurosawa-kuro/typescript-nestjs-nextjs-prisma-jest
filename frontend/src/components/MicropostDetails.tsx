import React from 'react';
import { Micropost } from '@/types/micropost';
import CommentList from '@/components/CommentList';
import { FaHeart } from 'react-icons/fa'; // アイコンをインポート

interface MicropostDetailsProps {
  micropost: Micropost;
}

const MicropostDetails: React.FC<MicropostDetailsProps> = ({ micropost }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{micropost.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="mb-4 flex justify-center items-center" style={{ maxHeight: '400px' }}>
          <img
            src={`http://localhost:3001/uploads/${micropost.imagePath}`}
            alt={micropost.title}
            className="max-w-full max-h-[400px] object-contain rounded"
          />
        </div>
        <div className="flex justify-between items-center text-gray-600 mb-2">
          <p>
            Posted by {micropost.user.name} on {new Date(micropost.createdAt).toLocaleDateString()}
          </p>
          <span className="flex items-center">
            <FaHeart className="text-red-500 mr-1" /> {micropost.likesCount}
          </span>
        </div>
      </div>
      <CommentList comments={micropost.comments} />
    </div>
  );
};

export default MicropostDetails;
