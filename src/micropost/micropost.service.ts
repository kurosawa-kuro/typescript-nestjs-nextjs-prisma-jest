import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Micropost } from '@prisma/client';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: number; title: string; imagePath: string }): Promise<Micropost> {
    // Make sure to return the result of the create operation
    return this.prisma.micropost.create({ data });
  }

  async all(): Promise<Micropost[]> {
    return this.prisma.micropost.findMany();
  }
}
