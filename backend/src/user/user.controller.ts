import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { BaseController } from '../common/base.controller';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Public()
  @Get()
  override async index(): Promise<User[]> {
    const usersWithoutPassword = await this.userService.all();
    return usersWithoutPassword as User[];
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: Partial<User>): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }
}
