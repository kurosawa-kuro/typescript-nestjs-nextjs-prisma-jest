import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  // マイクロポストのランキングを取得
  async getMicropostRanking() {
    const microposts = await this.prisma.micropost.findMany({
      select: {
        id: true,
        title: true,
        imagePath: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // レスポンスの形式を変換
    return microposts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      _count: undefined, // _countプロパティを削除
    }));
  }
}
