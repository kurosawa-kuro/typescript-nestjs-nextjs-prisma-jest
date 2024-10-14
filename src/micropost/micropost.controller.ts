import { Controller, Get, Post, Body } from '@nestjs/common';
import { MicropostService } from './micropost.service';
import { Micropost } from '@prisma/client';

@Controller('microposts')
export class MicropostController {
  constructor(private readonly micropostService: MicropostService) {}

  @Post()
  async createMicropost(@Body() micropostData: Omit<Micropost, 'id'>): Promise<Micropost> {
    return this.micropostService.createMicropost(micropostData);
  }

  @Get()
  async getAllMicroposts(): Promise<Micropost[]> {
    return this.micropostService.getAllMicroposts();
  }
}