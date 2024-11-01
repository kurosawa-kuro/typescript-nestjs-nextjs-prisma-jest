'use client';

import React, { useState, useEffect } from 'react';
import { Micropost, Comment } from '@/types/micropost';
import CommentList from '@/components/CommentList';
import { FaHeart, FaRegHeart, FaEye } from 'react-icons/fa';
import CreateCommentModal from '@/components/CreateCommentModal';
import { useAuthStore } from '@/store/authStore';
import { ClientSideApiService } from '@/services/clientSideApiService';

interface MicropostDetailsProps {
  micropost: Micropost;
}

const MicropostDetails: React.FC<MicropostDetailsProps> = ({ micropost }) => {
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FaEye className="text-gray-500" size={20} />
                <span>{viewsCount}</span>
              </div>
              <button 
                onClick={handleLikeClick}
                className="flex items-center gap-1 focus:outline-none"
                disabled={!user}
              >
                {isLiked ? (
                  <FaHeart className="text-red-500 hover:text-red-600 transition-colors" size={20} />
                ) : (
                  <FaRegHeart className="text-gray-500 hover:text-red-500 transition-colors" size={20} />
                )}
                <span>{likesCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Comments</h2>
          {user && (
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Comment
            </button>
          )}
        </div>
        <CommentList comments={comments} />
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
