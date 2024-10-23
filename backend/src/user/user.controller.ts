import {
  Controller,
  Get,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { BaseController } from '../common/base.controller';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from '../common/multer-config';
import { UserInfo, UserWithoutPassword } from '../types/auth.types';

@Controller('users')
export class UserController extends BaseController<UserWithoutPassword> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Public()
  @Get()
  override async index(): Promise<UserWithoutPassword[]> {
    return this.userService.all();
  }

  @Public()
  @Put(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', { ...multerConfig, ...multerOptions }),
  )
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.userService.updateAvatar(id, file.filename);
  }

  // ユーザーの権限をAdminに変更
  @Put(':id/admin')
  async updateAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'add');
  }

  // ユーザーの権限をAdminを外す
  @Put(':id/admin/remove')
  async removeAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'remove');
  }
}
