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

type UserWithoutPassword = Omit<User, 'password'>;
type UserWithRoles = UserWithoutPassword & {
  userRoles: { roleId: number; roleName: string }[];
};

@Controller('users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // 新しい型を定義


  @Public()
  @Get()
  override async index(): Promise<User[]> {
    const users = await this.userService.all();
    return users.map(user => ({
      ...user,
      password: undefined
    }));
  }

  // ユーザー詳細取得 Public Get
  // @Public()
  // @Get(':id')
  // async show(@Param('id', ParseIntPipe) id: number): Promise<User> {
  //   console.log('ユーザー詳細取得');
  //   return this.userService.findById(id);
  // }


  @Public()
  @Put(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', { ...multerConfig, ...multerOptions }))
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.userService.updateAvatar(id, file.filename);
  }
}
