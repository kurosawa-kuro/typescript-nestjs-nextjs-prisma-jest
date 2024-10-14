import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userData: Omit<User, 'id'>): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async all(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async find(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findBy(params: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: params });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findFirst(params: Prisma.UserWhereInput): Promise<User | null> {
    const user = await this.prisma.user.findFirst({ where: params });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: userData,
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async destroy(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}