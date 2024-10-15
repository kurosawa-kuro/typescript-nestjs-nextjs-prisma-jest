import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JwtPayload, UserInfo } from './types/auth.types';

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  extractTokenFromRequest(request: Request): string | undefined {
    const token = request.cookies['jwt'] || request.headers.authorization?.split(' ')[1];
    return token;
  }

  async getUserFromToken(request: Request): Promise<UserInfo> {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const payload = await this.verifyToken(token);
    return this.mapJwtPayloadToUserInfo(payload);
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

  private mapJwtPayloadToUserInfo(payload: JwtPayload): UserInfo {
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };
  }
}
