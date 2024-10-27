import React from 'react';
import { getMicroposts } from '../../actions/micropost';
import Timeline from '@/components/Timeline';

const POSTS_PER_PAGE = 6;

export default async function TimelinePage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const allMicroposts = await getMicroposts();
  
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const microposts = allMicroposts.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(allMicroposts.length / POSTS_PER_PAGE);

  return (
    <Timeline
      microposts={microposts}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
