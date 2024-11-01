'use client';

import React, { useState, useEffect } from 'react';
import { Micropost, Comment } from '@/types/micropost';
import CommentList from '@/components/CommentList';
import { FaHeart, FaRegHeart, FaEye, FaClock } from 'react-icons/fa';
import CreateCommentModal from '@/components/CreateCommentModal';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { ClientSideApiService } from '@/services/clientSideApiService';

const MicropostDetails: React.FC<{ micropost: Micropost }> = ({ micropost }) => {
  console.log("micropost",micropost);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [comments, setComments] = useState(micropost.comments);
  const [likesCount, setLikesCount] = useState(micropost.likesCount);
  const [isLiked, setIsLiked] = useState(micropost.isLiked || false);
  const [viewsCount, setViewsCount] = useState(micropost.viewsCount || 0);
  const { user } = useAuthStore();

  useEffect(() => {
    const recordView = async () => {
      try {
        await ClientSideApiService.addMicropostView(micropost.id);
        const updatedMicropost = await ClientSideApiService.getMicropostDetails(micropost.id) as Micropost;
        setViewsCount(updatedMicropost.viewsCount);
      } catch (error) {
        if (error instanceof Error && error.message.includes('P2002')) {
          console.log('View already recorded');
          return;
        }
        console.error('Failed to record view:', error);
      }
    };

    recordView();
  }, [micropost.id]);

  const handleCommentCreated = async () => {
    try {
      const updatedComments = await ClientSideApiService.getComments(micropost.id);
      setComments(updatedComments as Comment[]);
      setIsCommentModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh comments:', error);
    }
  };

  const handleLikeClick = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await ClientSideApiService.removeLike(micropost.id);
      } else {
        await ClientSideApiService.addLike(micropost.id);
      }

      window.location.reload();
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Main Content - Left Side */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Title and Meta Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">{micropost.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    {micropost.user.profile?.avatarPath && (
                      <Image
                        src={`${apiUrl}/uploads/${micropost.user.profile.avatarPath}`}
                        alt={micropost.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="text-gray-700">{micropost.user.name}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaClock className="mr-1" />
                  <span>{new Date(micropost.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <FaEye className="mr-1" />
                  <span>{viewsCount}</span>
                </div>
                <button 
                  onClick={handleLikeClick}
                  className="flex items-center text-gray-500 text-sm"
                  disabled={!user}
                >
                  {isLiked ? (
                    <FaHeart className="mr-1 text-red-500" />
                  ) : (
                    <FaRegHeart className="mr-1" />
                  )}
                  <span>{likesCount}</span>
                </button>
              </div>

              {/* Categories */}
              {micropost.categories && micropost.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {micropost.categories.map(category => (
                    <span
                      key={category.id}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Main Image */}
            <div className="border-t border-gray-100">
              <div className="max-h-[600px] overflow-hidden">
                <Image
                  src={`${apiUrl}/uploads/${micropost.imagePath}`}
                  alt={micropost.title}
                  width={1200}
                  height={800}
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Right Side */}
        <div className="w-[400px] bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Comments ({comments.length})
            </h2>
            {user && (
              <button
                onClick={() => setIsCommentModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Comment
              </button>
            )}
          </div>
          <div className="h-[calc(100vh-250px)] overflow-y-auto">
            <CommentList comments={comments} />
          </div>
        </div>
      </div>

      <CreateCommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        micropostId={micropost.id}
        onCommentCreated={handleCommentCreated}
      />
    </div>
  );
};

export default MicropostDetails;
