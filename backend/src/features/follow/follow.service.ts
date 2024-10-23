import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  private async findFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.findUnique({
      where: {
        followerId_followedId: { followerId, followedId },
      },
    });
  }

  private async createFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.create({
      data: { followerId, followedId },
    });
  }

  private async deleteFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.delete({
      where: {
        followerId_followedId: { followerId, followedId },
      },
    });
  }

  async follow(followerId: number, followedId: number): Promise<Partial<User>[]> {
    const existingFollow = await this.findFollowRelation(followerId, followedId);

    if (!existingFollow) {
      await this.createFollowRelation(followerId, followedId);
    }

    return this.getFollowing(followerId);
  }

  async unfollow(followerId: number, followedId: number): Promise<Partial<User>[]> {
    const existingFollow = await this.findFollowRelation(followerId, followedId);

    if (existingFollow) {
      await this.deleteFollowRelation(followerId, followedId);
    }

    return this.getFollowing(followerId);
  }

  async getFollowers(userId: number): Promise<Partial<User>[]> {
    const followers = await this.prisma.follow.findMany({
      where: { followedId: userId },
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
      where: { followerId: userId },
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
    const follow = await this.findFollowRelation(followerId, followedId);
    return !!follow;
  }
}
