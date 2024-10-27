import React from 'react';
import { getMicroposts } from '../../actions/micropost';
import MicropostCard from '@/components/MicropostCard';

export default async function Timeline() {
  const microposts = await getMicroposts();
  console.log("microposts", microposts);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Timeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {microposts.map((micropost) => (
          <MicropostCard key={micropost.id} micropost={micropost} />
        ))}
      </div>
    </div>
  );
}
