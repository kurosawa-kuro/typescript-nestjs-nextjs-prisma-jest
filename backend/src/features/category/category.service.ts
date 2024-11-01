import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoryWithMicroposts } from '../../shared/types/micropost.types';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number): Promise<CategoryWithMicroposts> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        microposts: {
          include: {
            micropost: {
              include: {
                _count: {
                  select: {
                    likes: true,
                    views: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category) throw new NotFoundException();

    return {
      id: category.id,
      name: category.name,
      microposts: category.microposts.map(relation => ({
        id: relation.micropost.id,
        likesCount: relation.micropost._count.likes,
        viewsCount: relation.micropost._count.views,
        isLiked: false
      }))
    };
  }
} 