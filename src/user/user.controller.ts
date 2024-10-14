import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() userData: Omit<User, 'id'>): Promise<User> {
    return this.userService.create(userData);
  }

  @Get()
  async index(): Promise<User[]> {
    return this.userService.all();
  }
}
