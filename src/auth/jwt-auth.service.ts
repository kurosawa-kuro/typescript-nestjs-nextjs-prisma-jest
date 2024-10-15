import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UserInfo } from './decorators/user.decorator';

export interface UserPayload {
  id: number;
  name: string;
  isAdmin: boolean;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'secretKey',
      expiresIn: '1h',
    });
  }

  async verifyToken(token: string): Promise<UserPayload> {
    return this.jwtService.verifyAsync<UserPayload>(token, {
      secret: this.configService.get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  extractTokenFromRequest(request: Request): string | undefined {
    if (request.cookies && request.cookies['jwt']) {
      return request.cookies['jwt'];
    }
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }

  extractUserInfo(payload: any): UserInfo {
    return {
      id: payload.id,
      name: payload.name,
      isAdmin: payload.isAdmin || false,
    };
  }

  async getUserFromToken(request: Request): Promise<UserInfo | null> {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      return null;
    }

    try {
      const payload = await this.verifyToken(token);
      return this.extractUserInfo(payload);
    } catch (error) {
      console.error('Invalid token:', error.message);
      return null;
    }
  }

  setTokenCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearTokenCookie(res: Response) {
    res.clearCookie('jwt');
  }
}
