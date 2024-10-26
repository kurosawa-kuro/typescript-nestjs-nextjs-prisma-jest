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

  @Public()
  @Get()
  async index(): Promise<UserWithoutPassword[]> {
    return this.userService.all();
  }

  // Follow 機能 statusを含むユーザー一覧取得
  @Get('with-follow-status')
  async getCurrentUserAndAllUsers(
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.findAllWithFollowStatus(currentUser.id as number);
  }

  // Follow 機能  follower リスト表示
  @Get(':id/followers')
  async getFollowers(@Param('id', ParseIntPipe) id: number): Promise<UserDetails[]> {
    return this.userService.getFollowers(id);
  }

  // Follow 機能  following  リスト表示
  @Get(':id/following')
  async getFollowing(@Param('id', ParseIntPipe) id: number): Promise<UserDetails[]> {
    return this.userService.getFollowing(id);
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

  // Follow 機能 フォローする そして最新のstatusを含むユーザー一覧をレスポンスする
  @Post(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.follow(currentUser.id, id);
  }

  // Follow 機能 フォロー解除する  そして最新のstatusを含むユーザー一覧をレスポンスする
  @Delete(':id/follow')
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo
  ): Promise<UserDetails[]> {
    return this.userService.unfollow(currentUser.id, id);
  }

  // ユーザーの権限をAdminを外す
  @Put(':id/admin/remove')
  async removeAdmin(@Param('id', ParseIntPipe) id: number): Promise<UserInfo> {
    return this.userService.updateUserRole(id, 'remove');
  }
}
