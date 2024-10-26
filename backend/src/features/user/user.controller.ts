import {
  Controller,
  Get,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { BaseController } from '@/core/common/base.controller';
import { Public } from '@/features/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from '@/core/common/multer-config';
import { UserDetails, UserInfo, UserWithoutPassword } from '@/shared/types/auth.types';
import { User as UserDecorator } from '@/features/auth/decorators/user.decorator';

@Controller('users')
export class UserController extends BaseController<UserWithoutPassword> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // ユーザー一覧取得
  @Public()
  @Get()
  async index(): Promise<UserWithoutPassword[]> {
    return this.userService.all();
  }

  // ユーザー詳細取得
  @Public()
  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithoutPassword & { userRoles: string[] }> {
    return this.userService.findByIdWithRelations(id);
  }

  // ユーザーアバター更新
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

  // フォロー関連機能
  @Get('with-follow-status')
  async getCurrentUserAndAllUsers(
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.findAllWithFollowStatus(Number(currentUser.id));
  }

  @Get(':id/followers')
  async getFollowers(@Param('id', ParseIntPipe) id: number): Promise<UserDetails[]> {
    return this.userService.getFollowers(id);
  }

  @Get(':id/following')
  async getFollowing(@Param('id', ParseIntPipe) id: number): Promise<UserDetails[]> {
    return this.userService.getFollowing(id);
  }

  @Post(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.follow(currentUser.id, id);
  }

  @Delete(':id/follow')
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.unfollow(currentUser.id, id);
  }

  // 管理者権限関連
  @Put(':id/admin')
  async updateAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'add');
  }

  @Put(':id/admin/remove')
  async removeAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'remove');
  }
}
