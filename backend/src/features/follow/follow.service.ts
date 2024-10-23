import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Follow, Prisma, User } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: number, followedId: number): Promise<Follow> {
    return this.prisma.follow.create({
      data: {
        followerId,
        followedId,
      },
    });
  }

  async unfollow(followerId: number, followedId: number): Promise<Follow> {
    return this.prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });
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
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return followers.map(({ follower }) => follower);
  }

  async getFollowing(userId: number): Promise<Follow[]> {
    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        followed: true,
      },
    });
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });
    return !!follow;
  }
}
