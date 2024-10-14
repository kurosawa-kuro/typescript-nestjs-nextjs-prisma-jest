import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@prisma/client';

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

  // 以下、Active Recordスタイルの追加メソッド例
  async find(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findBy(params: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({ where: params });
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async destroy(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}