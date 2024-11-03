import Image from 'next/image';
import { Micropost } from '@/types/micropost';

interface MainContentProps {
  micropost: Micropost;
  apiUrl: string;
  metaInfo: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ micropost, apiUrl, metaInfo }) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-4">{micropost.title}</h1>
      {metaInfo}
      
      {/* 画像コンテナのサイズ調整 */}
      <div className="relative w-full aspect-[4/3] mb-4">
        <Image
          src={`${apiUrl}/uploads/${micropost.imagePath}`}
          alt={micropost.title}
          fill
          className="object-contain rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      
      {/* カテゴリータグ */}
      <div className="mt-4 flex flex-wrap gap-2">
        {micropost.categories.map((category) => (
          <span
            key={category.id}
            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
          >
            {category.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MainContent; 