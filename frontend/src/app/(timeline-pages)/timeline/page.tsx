import React from 'react';
import { getMicroposts } from '../../actions/micropost';
import { getCategories } from '../../actions/category';
import Timeline from '@/components/Timeline';
import CategoryList from '@/components/CategoryList';

const POSTS_PER_PAGE = 6;

export default async function TimelinePage({ 
  searchParams 
}: { 
  searchParams: { 
    page?: string;
    search?: string;
    category?: string;
  } 
}) {
  const currentPage = Number(searchParams.page) || 1;
  const searchQuery = searchParams.search || '';
  const categoryId = searchParams.category;

  // 並行してデータを取得
  const [allMicroposts, categories] = await Promise.all([
    getMicroposts(searchQuery),
    getCategories()
  ]);
  
  // カテゴリーでフィルタリング（必要な場合）
  const filteredMicroposts = categoryId
    ? allMicroposts.filter(post => 
        post.categories?.some(cat => cat.id === Number(categoryId))
      )
    : allMicroposts;

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const microposts = filteredMicroposts.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(filteredMicroposts.length / POSTS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* メインコンテンツ */}
        <div className="flex-1">
          <Timeline
            microposts={microposts}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        
        {/* サイドバー */}
        <div className="w-80 flex-shrink-0">
          <CategoryList categories={categories} />
        </div>
      </div>
    </div>
  );
}
