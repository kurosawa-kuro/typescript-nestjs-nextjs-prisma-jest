import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
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
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.register(body);
    this.setTokenCookie(res, token);
    return { message: 'Registration successful' };
  }

  @Post('login')
  @Public()
  async login(@Body() body: SigninDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.signin(body);
    this.setTokenCookie(res, token);
    return { message: 'Login successful' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return this.authService.logout();
  }

  @Get('me')
  async me() {
    return this.authService.me();
  }

  private setTokenCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
