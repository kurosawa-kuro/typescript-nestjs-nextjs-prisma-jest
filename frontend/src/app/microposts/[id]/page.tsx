import React from 'react';
import { getMicropostDetails } from '@/app/actions/micropost';
import { notFound } from 'next/navigation';

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
      <div className="bg-white shadow-md rounded-lg p-6">
        <img
          src={`/uploads/${micropost.imagePath}`}
          alt={micropost.title}
          className="w-full h-64 object-cover mb-4 rounded"
        />
        <p className="text-gray-600 mb-2">
          Posted by User {micropost.userId} on {new Date(micropost.createdAt).toLocaleDateString()}
        </p>
        {/* ここに追加の詳細情報を表示できます */}
      </div>
    </div>
  );
}
