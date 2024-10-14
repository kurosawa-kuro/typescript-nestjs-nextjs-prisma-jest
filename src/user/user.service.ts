import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma } from '@prisma/client';
import { BaseService } from '../common/base.service';

@Injectable()
export class UserService extends BaseService<User> {
  protected entityName = 'User';

  constructor(protected prisma: PrismaService) {
    super();
  }

  async create(data: Partial<User>): Promise<User> {
    return this.prisma.user.create({ data: data as Prisma.UserCreateInput });
  }

  async all(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
    if (!user) {
      this.handleNotFound(id);
    }
    return user;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: parseInt(id, 10) },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        this.handleNotFound(id);
      }
      throw error;
    }
  }

  async destroy(id: string | number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async find(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findFirst(where: Prisma.UserWhereInput): Promise<User> {
    const user = await this.prisma.user.findFirst({ where });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
