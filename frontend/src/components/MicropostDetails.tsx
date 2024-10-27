import React from 'react';
import { Micropost } from '@/types/micropost';
import CommentList from '@/components/CommentList';
import { FaHeart } from 'react-icons/fa'; // アイコンをインポート

interface MicropostDetailsProps {
  micropost: Micropost;
}

const MicropostDetails: React.FC<MicropostDetailsProps> = ({ micropost }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{micropost.title}</h1>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="aspect-w-16 aspect-h-9" style={{ maxHeight: '450px' }}>
          <div className="max-h-[450px] overflow-hidden">
            <img
              src={`http://localhost:3001/uploads/${micropost.imagePath}`}
              alt={micropost.title}
              className="object-contain w-full h-full max-h-[300px]"
            />
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center text-gray-600 text-sm mb-4">
            <p>
              Posted by <span className="font-semibold">{micropost.user.name}</span> on {new Date(micropost.createdAt).toLocaleDateString()}
            </p>
            <span className="flex items-center">
              <FaHeart className="text-red-500 mr-1" /> {micropost.likesCount}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <CommentList comments={micropost.comments} />
      </div>
    </div>
  );
};

export default MicropostDetails;
