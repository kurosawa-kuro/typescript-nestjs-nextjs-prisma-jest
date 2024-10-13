import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  // sampleテーブルのデータを追加するサンプルを教えてください。
  async addSample(title: string): Promise<string> {
    const sample = await this.prisma.sample.create({
      data: {
        title: title,
      },
    });
    return sample.title;
  }

  // sampleテーブルのデータを全て取得するサンプルを教えてください。
  async getAllSample(): Promise<string[]> {
    const samples = await this.prisma.sample.findMany();
    return samples.map((sample) => sample.title);
  }
}
