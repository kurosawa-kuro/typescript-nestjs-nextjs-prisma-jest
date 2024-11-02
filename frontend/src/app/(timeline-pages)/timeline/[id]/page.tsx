import React from 'react';
import { getMicropostDetails } from '@/app/actions/micropost';
import { notFound } from 'next/navigation';
import MicropostDetails from '@/components/MicropostDetails';
import CategoryList from '@/components/CategoryList';
import { getCategories } from '@/app/actions/category';

interface MicropostDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function MicropostDetailsPage({ params }: MicropostDetailsPageProps) {
  const micropostId = parseInt(params.id, 10);
  
  if (isNaN(micropostId)) {
    notFound();
  }

  const micropost = await getMicropostDetails(micropostId);
  const categories = await getCategories();

  if (!micropost) {
    notFound();
  }

  return (
    <div className="flex gap-8">  
      <MicropostDetails micropost={micropost} />
      <div className="w-80 flex-shrink-0">
        <CategoryList categories={categories} />  
      </div>
    </div>
  );
}
