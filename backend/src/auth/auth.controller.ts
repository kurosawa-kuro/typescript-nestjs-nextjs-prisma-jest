import { Controller, Post, Get, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { Response } from 'express';
import { LoginDto, RegisterDto, UserInfo } from '../types/auth.types';
import { AuthGuard } from './guards/auth.guard';
import { Prisma } from '@prisma/client';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(
    @Body() data: Prisma.UserCreateInput & { password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.register(data);
    this.authService.setTokenCookie(res, token);
    return { message: 'Registration successful', token, user };
  }

  @Post('login')
  @Public()
  async login(
    @Body() LoginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.login(LoginDto);
    this.authService.setTokenCookie(res, token);
    return { message: 'Login successful', token, user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(res);
    return result;
  }

  @Get('me')
  async me(@User() user: UserInfo) {
    return user;
  }
}
