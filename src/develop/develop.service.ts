import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { seed } from '../../prisma/seed';

@Injectable()
export class DevelopService {
  constructor(private prisma: PrismaService) {}

  async resetDb() {
    await this.prisma.$transaction([
      this.prisma.micropost.deleteMany(),
      this.prisma.user.deleteMany(),
      // 他のテーブルがある場合は、ここに追加します
    ]);

    // Call the seed function directly
    await seed();
    return { message: 'Database has been reset.' };
  }
}
