import React from 'react';
import { Comment } from '@/types/micropost';
import CommentItem from '@/components/CommentItem';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
};

export default CommentList;
