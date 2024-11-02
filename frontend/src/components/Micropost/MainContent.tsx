import Image from 'next/image';
import { Micropost } from '@/types/micropost';

interface MainContentProps {
  micropost: Micropost;
  apiUrl: string;
  metaInfo: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ micropost, apiUrl, metaInfo }) => (
  <div className="flex-1 min-w-0">
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{micropost.title}</h1>
        {metaInfo}
        
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
);

export default MainContent; 