import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Micropost, Prisma } from '@prisma/client';
import { BasicMicropost, Comment, DetailedMicropost } from '@/shared/types/micropost.types';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MicropostCreateInput): Promise<Micropost> {
    return this.prisma.micropost.create({ data });
  }

  async all(): Promise<DetailedMicropost[]> {
    return this.prisma.micropost.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
                    avatarPath: true
                  }
                }
              }
            }
          }
        }
      },
    }).then(microposts =>
      microposts.map(micropost => ({
        ...micropost,
        createdAt: micropost.createdAt.toISOString(),
        updatedAt: micropost.updatedAt.toISOString(),
        user: {
          id: micropost.user.id,
          name: micropost.user.name,
        },
        likesCount: micropost._count.likes,
        comments: micropost.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          user: {
            id: comment.user.id,
            name: comment.user.name,
            profile: {
              avatarPath: comment.user.profile?.avatarPath
            }
          }
        }))
      }))
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

  async findOne(id: number): Promise<DetailedMicropost | null> {
    return this.prisma.micropost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: { likes: true }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatarPath: true
                  }
                }
              }
            }
          }
        }
      }
    }).then(micropost => 
      micropost 
        ? {
            ...micropost,
            createdAt: micropost.createdAt.toISOString(),
            updatedAt: micropost.updatedAt.toISOString(),
            likesCount: micropost._count.likes,
            comments: micropost.comments.map(comment => ({
              ...comment,
              createdAt: comment.createdAt.toISOString(),
              updatedAt: comment.updatedAt.toISOString(),
              user: {
                id: comment.user.id,
                name: comment.user.name,
                profile: {
                  avatarPath: comment.user.profile?.avatarPath
                }
              }
            }))
          } as DetailedMicropost
        : null
    );
  }
}
