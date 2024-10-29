import React from 'react';
import { getMicropostDetails } from '@/app/actions/micropost';
import { notFound } from 'next/navigation';
import MicropostDetails from '@/components/MicropostDetails';

interface MicropostDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function MicropostDetailsPage({ params }: MicropostDetailsPageProps) {
  const micropostId = parseInt(params.id, 10);
  const micropost = await getMicropostDetails(micropostId);

  if (!micropost) {
    notFound();
  }

  return <MicropostDetails micropost={micropost} />;
}
