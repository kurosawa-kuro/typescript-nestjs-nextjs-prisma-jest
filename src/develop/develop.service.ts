import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { seed } from '../../prisma/seed';

@Injectable()
export class DevelopService {
  constructor(private prisma: PrismaService) {}

  async resetDb() {
    // Call the seed function directly
    await seed();
    return { message: 'Database has been reset.' };
  }
}
