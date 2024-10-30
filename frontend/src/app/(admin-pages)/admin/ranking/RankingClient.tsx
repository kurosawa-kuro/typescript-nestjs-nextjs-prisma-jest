'use client';

import { Micropost } from '@/types/micropost';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Image from 'next/image';

// Chart.jsの登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RankingClientProps {
  rankingData: Micropost[];
}

export default function RankingClient({ rankingData }: RankingClientProps) {
  // チャートのオプション
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'いいね数ランキング',
        font: {
          size: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'いいね数',
        },
      },
      x: {
        title: {
          display: true,
          text: '投稿タイトル',
        },
      },
    },
  };

  // チャートのデータ
  const chartData = {
    labels: rankingData.map(post => post.title),
    datasets: [
      {
        data: rankingData.map(post => post.likesCount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">マイクロポストランキング</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* チャートセクション */}
        <div className="p-4 bg-white rounded-lg shadow">
          <Bar options={options} data={chartData} />
        </div>

        {/* リストセクション */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {rankingData.map((post, index) => (
            <div 
              key={post.id} 
              className="border p-4 rounded-lg shadow bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full">
                  <span className="text-xl font-bold">#{index + 1}</span>
                </div>
                <div className="flex-grow">
                  <h2 className="font-semibold text-lg">{post.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>投稿者: {post.user.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>👍</span>
                      <span>{post.likesCount}</span>
                    </span>
                  </div>
                </div>
                {post.imagePath && (
                  <div className="flex-shrink-0">
                    <img
                      src={`http://localhost:3001/uploads/${post.imagePath}`}
                      alt={post.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 