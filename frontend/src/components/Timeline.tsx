'use client';

import React, { useState } from 'react';
import MicropostCard from '@/components/MicropostCard';
import Link from 'next/link';
import { Micropost } from '@/types/micropost'; // 適切なパスに調整してください
import CreatePostModal from './CreatePostModal';

const POSTS_PER_PAGE = 6;

interface TimelineProps {
  microposts: Micropost[];
  currentPage: number;
  totalPages: number;
}

const Timeline: React.FC<TimelineProps> = ({ microposts, currentPage, totalPages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 投稿ボタン追加 */}
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {microposts.map((micropost) => (
          <MicropostCard key={micropost.id} micropost={micropost} />
        ))}
      </div>
      
      {/* ページャー */}
      <div className="flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          {currentPage > 1 && (
            <Link href={`/timeline?page=${currentPage - 1}`} className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50">
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/timeline?page=${page}`}
              className={`px-4 py-2 bg-white border border-gray-300 text-sm font-medium ${
                currentPage === page ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link href={`/timeline?page=${currentPage + 1}`} className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50">
              Next
            </Link>
          )}
        </nav>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Timeline;
