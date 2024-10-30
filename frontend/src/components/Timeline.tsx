'use client';

import React, { useState } from 'react';
import MicropostCard from '@/components/MicropostCard';
import Link from 'next/link';
import { TimelineProps } from '@/types/micropost'; // 適切なパスに調整してください
import CreatePostModal from './CreatePostModal';
import { useAuthStore } from '@/store/authStore';

const POSTS_PER_PAGE = 6;

const Timeline: React.FC<TimelineProps> = ({ microposts, currentPage, totalPages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  const currentSearchQuery = new URLSearchParams(window.location.search).get('search') || '';

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (currentSearchQuery) {
      params.set('search', currentSearchQuery);
    }
    return `/timeline?${params.toString()}`;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = `/timeline?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </form>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap"
          >
            Create New Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {microposts.map((micropost) => (
          <MicropostCard key={micropost.id} micropost={micropost} />
        ))}
      </div>
      
      <div className="flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          {currentPage > 1 && (
            <Link 
              href={getPageUrl(currentPage - 1)} 
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`px-4 py-2 bg-white border border-gray-300 text-sm font-medium ${
                currentPage === page ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link 
              href={getPageUrl(currentPage + 1)} 
              className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
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
