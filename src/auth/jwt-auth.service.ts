import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface UserPayload {
  id: number;
  name: string;
  isAdmin: boolean;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
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

  extractUserInfo(payload: any): UserPayload {
    return { 
      id: payload.id, 
      name: payload.name,
      isAdmin: payload.isAdmin || false
    };
  }
}
