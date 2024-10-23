import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: number, followedId: number): Promise<Partial<User>[]> {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    if (!existingFollow) {
      // Create the follow relationship only if it doesn't exist
      await this.prisma.follow.create({
        data: {
          followerId,
          followedId,
        },
      });
    }

    // フォローしているユーザーをレスポンス
    return await this.getFollowing(followerId);
  }

  async unfollow(followerId: number, followedId: number): Promise<Partial<User>[]> {
    // フォロー関係が存在するか確認
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    if (existingFollow) {
      // フォロー関係が存在する場合のみ削除
      await this.prisma.follow.delete({
        where: {
          followerId_followedId: {
            followerId,
            followedId,
          },
        },
      });
    }

    // フォロー解除後のフォローしているユーザーリストを返す
    return await this.getFollowing(followerId);
  }

  async getFollowers(userId: number): Promise<Partial<User>[]> {
    const followers = await this.prisma.follow.findMany({
      where: {
        followedId: userId,
      },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarPath: true,
          },
        },
      },
    });

    return followers.map(({ follower }) => follower);
  }

  async getFollowing(userId: number): Promise<Partial<User>[]> {
    const following = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followed: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarPath: true,
          },
        },
      },
    });

    return following.map(({ followed }) => followed);
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId: followerId,
          followedId: followedId
        }
      },
    });
    
    return !!follow;
  }
}
