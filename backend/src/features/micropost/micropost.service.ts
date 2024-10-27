import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Micropost, Prisma } from '@prisma/client';
import { Comment, User, UserProfile } from '@prisma/client';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MicropostCreateInput): Promise<Micropost> {
    return this.prisma.micropost.create({ data });
  }

  async all(): Promise<(Micropost & {
    user: { id: number; name: string };
    likesCount: number;
  })[]> {
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
      },
    }).then(microposts =>
      microposts.map(micropost => ({
        ...micropost,
        user: {
          id: micropost.user.id,
          name: micropost.user.name,
        },
        likesCount: micropost._count.likes,
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

  async findOne(id: number): Promise<(Omit<Micropost, 'password'> & { 
    likesCount: number, 
    user: Pick<User, 'id' | 'name'>,
    comments: Array<Comment & { 
      user: Pick<User, 'id' | 'name'> & { 
        profile: Pick<UserProfile, 'avatarPath'> 
      } 
    }> 
  }) | null> {
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
            likesCount: micropost._count.likes,
            comments: micropost.comments.map(comment => ({
              ...comment,
              user: {
                id: comment.user.id,
                name: comment.user.name,
                profile: {
                  avatarPath: comment.user.profile?.avatarPath
                }
              }
            }))
          }
        : null
    );
  }
}
