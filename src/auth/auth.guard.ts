import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
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
      const payload = await this.jwtService.verifyAsync(token);
      // Add user information to the request object
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    if (request.cookies) {
      console.log('request.cookies', request.cookies);
      // Try to get the token from either 'jwt' or 'token' cookie
      return request.cookies['jwt'] || request.cookies['token'];
    }
    // If cookies are not available, try to extract from headers
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
