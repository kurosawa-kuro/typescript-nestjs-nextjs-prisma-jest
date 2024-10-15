import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { IS_ADMIN_KEY } from './decorators/admin.decorator';
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

    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: 'secretKey' });
      console.log('admin payload', payload);
      // userからpayload.idをUser IDとして取得
      const user = await this.prismaService.user.findUnique({ where: { id: payload.id } });
      
      console.log('user.isAdmin', user.isAdmin);
      request['user'] = this.extractUserInfo(payload);

      if (isAdmin && !user.isAdmin) {
        throw new UnauthorizedException('Admin access required');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or insufficient permissions');
    }
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

  private extractUserInfo(payload: any) {
    return { 
      id: payload.id, 
      name: payload.name,
      isAdmin: payload.isAdmin || false // Adminフラグを追加
    };
  }
}
