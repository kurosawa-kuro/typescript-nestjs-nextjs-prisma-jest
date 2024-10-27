import React from 'react';
import { Micropost } from '@/types/micropost';
import CommentList from '@/components/CommentList';

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
        <p className="text-gray-600 mb-2">
          Posted by User {micropost.userId} on {new Date(micropost.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">{micropost.likesCount}</span> {micropost.likesCount === 1 ? 'like' : 'likes'}
        </p>
      </div>
      <CommentList comments={micropost.comments} />
    </div>
  );
};

export default MicropostDetails;
