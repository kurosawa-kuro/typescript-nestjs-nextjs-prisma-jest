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
import { UserDetails, UserInfo, UserWithoutPassword } from '@/shared/types/user.types';
import { User as UserDecorator } from '@/features/auth/decorators/user.decorator';

@Controller('users')
export class UserController extends BaseController<UserDetails> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // 全ユーザー一覧を取得（パスワード除く）
  @Public()
  @Get()
  async index(): Promise<UserDetails[]> {
    return this.userService.all();
  }

  // フォロー状態を含む全ユーザー一覧を取得
  @Get('with-follow-status')
  async getCurrentUserAndAllUsers(
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.findAllWithFollowStatus(currentUser.id as number);
  }

  // 特定ユーザーのフォロワーリストを取得
  @Get(':id/followers')
  async getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.getFollowers(id, currentUser.id);
  }

  // 特定ユーザーのフォロー中ユーザーリストを取得
  @Get(':id/following')
  async getFollowing(@Param('id', ParseIntPipe) id: number): Promise<UserDetails[]> {
    return this.userService.getFollowing(id);
  }

  // 特定ユーザーの詳細情報を取得（パスワード除く、ロール情報含む）ログインユーザーとのフォロー状態も含む
  @Public()
  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser?: UserInfo
  ): Promise<UserDetails> {
    return this.userService.findByIdWithRelationsAndFollowStatus(id, currentUser?.id);
  }

  // ユーザーのアバター画像を更新
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

  // ユーザーに管理者権限を付与
  @Put(':id/admin')
  async updateAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'add');
  }

  // ユーザーをフォローし、更新された全ユーザーリストを返す
  @Post(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.follow(currentUser.id, id);
  }

  // ユーザーのフォローを解除し、更新された全ユーザーリストを返す
  @Delete(':id/follow')
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.unfollow(currentUser.id, id);
  }

  // ユーザーの管理者権限を削除
  @Put(':id/admin/remove')
  async removeAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserDetails> {
    return this.userService.updateUserRole(id, 'remove');
  }
}
