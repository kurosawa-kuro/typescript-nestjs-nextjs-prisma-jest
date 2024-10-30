import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Micropost, Prisma } from '@prisma/client';
import {
  BasicMicropost,
  Comment,
  DetailedMicropost,
} from '@/shared/types/micropost.types';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MicropostCreateInput): Promise<DetailedMicropost> {
    const micropost = await this.prisma.micropost.create({
      data,
      include: {
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
          select: { likes: true },
        },
        comments: {
          include: {
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
          },
        },
      },
    });

    return {
      id: micropost.id,
      userId: micropost.userId,
      title: micropost.title,
      imagePath: micropost.imagePath,
      createdAt: micropost.createdAt.toISOString(),
      updatedAt: micropost.updatedAt.toISOString(),
      likesCount: micropost._count.likes,
      user: {
        id: micropost.user.id,
        name: micropost.user.name,
      },
      comments: micropost.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        micropostId: comment.micropostId,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          profile: {
            avatarPath: comment.user.profile?.avatarPath,
          },
        },
      })),
    };
  }

  async all(search?: string): Promise<DetailedMicropost[]> {
    return this.prisma.micropost
      .findMany({
        where: search ? {
          title: {
              contains: search,
              mode: 'insensitive',
            },
          }
          : undefined,
        include: {
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
            select: { likes: true },
          },
          comments: {
            include: {
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      .then((microposts) =>
        microposts.map((micropost) => ({
          id: micropost.id,
          userId: micropost.userId,
          title: micropost.title,
          imagePath: micropost.imagePath,
          createdAt: micropost.createdAt.toISOString(),
          updatedAt: micropost.updatedAt.toISOString(),
          likesCount: micropost._count.likes,
          user: {
            id: micropost.user.id,
            name: micropost.user.name,
          },
          comments: micropost.comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            micropostId: comment.micropostId,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
            user: {
              id: comment.user.id,
              name: comment.user.name,
              profile: {
                avatarPath: comment.user.profile?.avatarPath,
              },
            },
          })),
        })),
      );
  }

  async findById(id: number): Promise<Micropost> {
    const micropost = await this.prisma.micropost.findUnique({ where: { id } });
    if (!micropost) {
      throw new NotFoundException(`Micropost with ID ${id} not found`);
    }
    return micropost;
  }

  async update(
    id: number,
    data: Prisma.MicropostUpdateInput,
  ): Promise<Micropost> {
    try {
      return await this.prisma.micropost.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Micropost with ID ${id} not found`);
      }
      throw error;
    }
  }

  async destroy(id: number): Promise<Micropost> {
    try {
      return await this.prisma.micropost.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Micropost with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<Micropost[]> {
    return this.prisma.micropost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' as Prisma.SortOrder },
    });
  }

  async findOne(
    id: number,
    currentUserId?: number,
  ): Promise<DetailedMicropost | null> {
    console.log('Micropostid', id);
    const micropost = await this.prisma.micropost.findUnique({
      where: { id },
      include: {
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
          select: { likes: true },
        },
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                userId: true,
              },
            }
          : false,
        comments: {
          include: {
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
          },
        },
      },
    });

    if (!micropost) return null;

    const isLiked = currentUserId
      ? micropost.likes && micropost.likes.length > 0
      : false;

    return {
      id: micropost.id,
      userId: micropost.userId,
      title: micropost.title,
      imagePath: micropost.imagePath,
      createdAt: micropost.createdAt.toISOString(),
      updatedAt: micropost.updatedAt.toISOString(),
      likesCount: micropost._count.likes,
      isLiked,
      user: micropost.user,
      comments: micropost.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        micropostId: comment.micropostId,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          profile: {
            avatarPath: comment.user.profile?.avatarPath,
          },
        },
      })),
    };
  }
}
