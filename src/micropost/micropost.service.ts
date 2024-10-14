import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Micropost } from '@prisma/client';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  async createMicropost(data: Omit<Micropost, 'id'>): Promise<Micropost> {
    return this.prisma.micropost.create({ data });
  }

  async getAllMicroposts(): Promise<Micropost[]> {
    return this.prisma.micropost.findMany();
  }
}
