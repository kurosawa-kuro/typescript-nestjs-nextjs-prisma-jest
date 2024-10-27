import React from 'react';
import { getMicropostDetails } from '@/app/actions/micropost';
import { notFound } from 'next/navigation';
import { Micropost } from '@/types/micropost';

interface MicropostDetailsProps {
  params: {
    id: string;
  };
}

export default async function MicropostDetails({ params }: MicropostDetailsProps) {
  const micropostId = parseInt(params.id, 10);
  const micropost = await getMicropostDetails(micropostId);

  if (!micropost) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{micropost.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <img
          src={`/uploads/${micropost.imagePath}`}
          alt={micropost.title}
          className="w-full h-64 object-cover mb-4 rounded"
        />
        <p className="text-gray-600 mb-2">
          Posted by User {micropost.userId} on {new Date(micropost.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">{micropost.likesCount}</span> {micropost.likesCount === 1 ? 'like' : 'likes'}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {micropost.comments.map((comment) => (
          <div key={comment.id} className="bg-white shadow-md rounded-lg p-4">
            <p className="mb-2">{comment.content}</p>
            <div className="flex items-center text-sm text-gray-600">
              <img
                src={`/uploads/${comment.user.profile.avatarPath}`}
                alt={`${comment.user.name}'s avatar`}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{comment.user.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
