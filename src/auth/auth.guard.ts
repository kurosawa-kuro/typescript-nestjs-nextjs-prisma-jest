import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      console.log('token', token);
      const payload = await this.jwtService.verifyAsync(token, { secret: 'secretKey' });
      request['user'] = { id: payload.id, name: payload.name };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    console.log('request.cookies', request.cookies);
    console.log('request.headers.authorization', request.headers.authorization);
    if (request.cookies && Object.keys(request.cookies).length > 0) {
      console.log('extractTokenFromCookie request.cookies', request.cookies);
      // Get the token from 'jwt' cookie
      return request.cookies['jwt'];
    }
    // If cookies are not available or empty, try to extract from headers
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
