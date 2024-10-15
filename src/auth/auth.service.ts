import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { SigninDto, RegisterDto, UserInfo } from '../types/auth.types';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'JWT_SECRET';
  }

  async register(RegisterDto: RegisterDto): Promise<string> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: RegisterDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(RegisterDto.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email: RegisterDto.email,
        name: RegisterDto.name,
        passwordHash: hashedPassword,
      },
    });

    return this.signToken(this.mapUserToUserInfo(user));
  }

  async signin(signinDto: SigninDto): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: { email: signinDto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new InternalServerErrorException('User password hash is missing');
    }

    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.signToken(this.mapUserToUserInfo(user));
  }

  async signToken(payload: UserInfo): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '1d',
    });
  }

  async verifyToken(token: string): Promise<UserInfo> {
    return await this.jwtService.verifyAsync<UserInfo>(token, {
      secret: this.jwtSecret,
    });
  }

  extractTokenFromRequest(request: Request): string | undefined {
    return request.cookies['jwt'] || request.headers.authorization?.split(' ')[1];
  }

  async getUserFromToken(request: Request): Promise<UserInfo> {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    return await this.verifyToken(token);
  }

  setTokenCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  clearTokenCookie(res: Response) {
    res.clearCookie('jwt');
  }

  private mapUserToUserInfo(user: any): UserInfo {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };
  }
}
