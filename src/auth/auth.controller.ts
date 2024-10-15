import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthService } from './jwt-auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Public } from './decorators/public.decorator';
import { Response } from 'express';

export class SigninDto {
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(6)
    passwordHash: string;
  }

  export class SignupDto {
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(6)
    passwordHash: string;
  }
  
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtAuthService: JwtAuthService
  ) {}

  @Post('register')
  @Public()
  async register(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.register(body);
    this.jwtAuthService.setTokenCookie(res, token);
    return { message: 'Registration successful' };
  }

  @Post('login')
  @Public()
  async login(@Body() body: SigninDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.signin(body);
    this.jwtAuthService.setTokenCookie(res, token);
    return { message: 'Login successful' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.jwtAuthService.clearTokenCookie(res);
    return this.authService.logout();
  }

  @Get('me')
  async me() {
    return this.authService.me();
  }
}
