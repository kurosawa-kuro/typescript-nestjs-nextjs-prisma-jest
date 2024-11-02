import { getCategoryDetail } from '@/app/actions/category';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const category = await getCategoryDetail(Number(params.id));

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Category: {category.name}
        </h1>
        <p className="text-gray-600 mt-2">
          {category.microposts.length} posts in this category
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.microposts.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={`http://localhost:3001/uploads/${post.imagePath}`}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {post.title}
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Image
                      src={`http://localhost:3001/uploads/${post.user.profile.avatarPath}`}
                      alt={post.user.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {post.user.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>♥ {post.likesCount}</span>
                    <span>👁 {post.viewsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {category.microposts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No posts found in this category.</p>
        </div>
      )}
    </div>
  );
}
