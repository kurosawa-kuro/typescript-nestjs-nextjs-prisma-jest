import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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

  @Get()
  async index(): Promise<Micropost[]> {
    return this.micropostService.all();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.micropostService.findOne(+id);
  }
}
