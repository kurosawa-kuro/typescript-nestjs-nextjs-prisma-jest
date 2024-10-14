import { Controller, Get, Post, Body } from '@nestjs/common';
import { MicropostService } from './micropost.service';
import { Micropost } from '@prisma/client';

@Controller('microposts')
export class MicropostController {
  constructor(private readonly micropostService: MicropostService) {}

  @Post()
  async create(
    @Body() micropostData: Omit<Micropost, 'id'>,
  ): Promise<Micropost> {
    return this.micropostService.create(micropostData);
  }

  @Get()
  async index(): Promise<Micropost[]> {
    return this.micropostService.all();
  }
}
