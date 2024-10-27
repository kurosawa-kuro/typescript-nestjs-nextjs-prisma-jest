import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { MicropostService } from './micropost.service';
import { Micropost } from '@prisma/client';

@Controller('microposts')
export class MicropostController {
  constructor(private readonly micropostService: MicropostService) {}

  @Post()
  async create(
    @Body()
    micropostData: Omit<Micropost, 'id' | 'createdAt' | 'updatedAt'> & {
      user: { connect: { id: number } };
    },
  ): Promise<Micropost> {
    return this.micropostService.create(micropostData);
  }

    // マイクロポストに紐づく、「紐づいたユーザーID、ユーザー名」「いいねの数」も取得
  @Get()
  async index(): Promise<(Omit<Micropost, 'createdAt' | 'updatedAt'> & {
    user: { id: number; name: string };
    likesCount: number;
    createdAt: string;
    updatedAt: string;
  })[]> {
    return this.micropostService.all();
  }

  // マイクロポストに紐づく、「コメント 紐づいたユーザーID、ユーザー名、アバター」「いいねの数」も取得
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const micropost = await this.micropostService.findOne(+id);
    if (!micropost) {
      throw new NotFoundException(`Micropost with ID ${id} not found`);
    }
    return micropost;
  }
}
