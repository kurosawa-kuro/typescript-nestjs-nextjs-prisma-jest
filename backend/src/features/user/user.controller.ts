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
import { BaseController } from '@/core/common/base.controller';
import { Public } from '@/features/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from '@/core/common/multer-config';
import { UserInfo, UserWithoutPassword } from '@/shared/types/auth.types';
import { User as UserDecorator } from '@/features/auth/decorators/user.decorator';

@Controller('users')
export class UserController extends BaseController<UserWithoutPassword> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Public()
  @Get()
  async index(): Promise<UserWithoutPassword[]> {
    return this.userService.all();
  }

  @Get('current')
  async getCurrentUserAndAllUsers(
    @UserDecorator() currentUser: UserInfo,
  ): Promise<{ currentUser: UserInfo; allUsers: UserWithoutPassword[] }> {
    const allUsers = await this.userService.all();
    return {
      currentUser,
      allUsers
    };
  }

  // ユーザー情報詳細取得をオーバーライドして実装。パスワード除外 必須
  @Public()
  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithoutPassword & { userRoles: string[] }> {
    return this.userService.findByIdWithRelations(id);
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
