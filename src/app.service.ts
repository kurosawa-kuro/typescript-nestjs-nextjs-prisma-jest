import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    // sampleテーブルにデータを挿入
    const sample = await this.prisma.sample.create({
      data: {
        title: 'sample',
      },
    });
    return sample.title;
  }
}
