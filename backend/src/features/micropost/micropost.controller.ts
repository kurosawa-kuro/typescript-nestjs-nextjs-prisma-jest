import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
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
  @UseInterceptors(
    FileInterceptor('image', {
      ...multerConfig,
      ...multerOptions,
    }),
  )
  async create(
    @Body() data: { title: string; categoryIds: string },
    @UploadedFile() image: Express.Multer.File,
    @User() currentUser: UserInfo,
  ): Promise<DetailedMicropost> {
    const categoryIds = JSON.parse(data.categoryIds) as number[];
    
    const micropostData = {
      title: data.title,
      imagePath: image ? `${image.filename}` : null,
      user: {
        connect: { id: currentUser.id },
      },
      categories: {
        create: categoryIds.map(categoryId => ({
          category: {
            connect: { id: categoryId }
          }
        }))
      }
    };
    return this.micropostService.create(micropostData);
  }

  // マイクロポストに紐づく、「紐づいたユーザーID、ユーザー名」「いいねの数」も取得
  // 検索機能を追加
  @OptionalAuth()
  @Get()
  async index(@Query('search') search?: string): Promise<DetailedMicropost[]> {
    console.log('Search Query:', search);
    return this.micropostService.all(search);
  }

  // マイクロポストに紐づく、「コメント 紐づいたユーザーID、ユーザー名、アバター」「いいねの数」も取得
  @OptionalAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() currentUser?: UserInfo,
  ): Promise<DetailedMicropost> {
    console.log('Current User:', currentUser);
    const micropost = await this.micropostService.findOne(+id, currentUser?.id);

    if (!micropost) {
      throw new NotFoundException(`Micropost with ID ${id} not found`);
    }

    return micropost;
  }
}
