import { Controller, Get } from '@nestjs/common';
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
}
