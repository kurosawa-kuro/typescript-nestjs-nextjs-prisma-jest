import { Controller, Get, Post, Body, Param, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MicropostService } from './micropost.service';
import { DetailedMicropost } from '@/shared/types/micropost.types';
import { User } from '@/features/auth/decorators/user.decorator';
import { UserInfo } from '@/shared/types/user.types';
import { multerConfig, multerOptions } from '@/core/common/multer-config';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';

@Controller('microposts')
export class MicropostController {
  constructor(private readonly micropostService: MicropostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    ...multerConfig,
    ...multerOptions,
  }))
  async create(
    @Body() data: { title: string },
    @UploadedFile() image: Express.Multer.File,
    @User() currentUser: UserInfo,
  ): Promise<DetailedMicropost> {
    const micropostData = {
      title: data.title,
      imagePath: image ? `${image.filename}` : null,
      user: {
        connect: { id: currentUser.id }
      }
    };
    return this.micropostService.create(micropostData);
  }

  // マイクロポストに紐づく、「紐づいたユーザーID、ユーザー名」「いいねの数」も取得
  // Publicに変更
  @OptionalAuth()
  @Get()
  async index(): Promise<DetailedMicropost[]> {
    return this.micropostService.all();
  }

  // マイクロポストに紐づく、「コメント 紐づいたユーザーID、ユーザー名、アバター」「いいねの数」も取得
  @OptionalAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() currentUser?: UserInfo
  ): Promise<DetailedMicropost> {
    console.log('Current User:', currentUser);
    const micropost = await this.micropostService.findOne(
      +id,
      currentUser?.id
    );
    
    if (!micropost) {
      throw new NotFoundException(`Micropost with ID ${id} not found`);
    }
    
    return micropost;
  }
}
