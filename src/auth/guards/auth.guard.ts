import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';

interface JwtPayload {
  id: number;
  name: string;
  isAdmin?: boolean;
}

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = await this.verifyToken(token);
      const user = await this.getUserFromPayload(payload);
      request['user'] = this.extractUserInfo(payload);

      if (this.isAdminRoute(context) && !user.isAdmin) {
        throw new UnauthorizedException('Admin access required');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or insufficient permissions');
    }
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isAdminRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    if (request.cookies && request.cookies['jwt']) {
      return request.cookies['jwt'];
    }
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token, { secret: 'secretKey' });
  }

  private async getUserFromPayload(payload: JwtPayload) {
    return this.prismaService.user.findUnique({ where: { id: payload.id } });
  }

  private extractUserInfo(payload: JwtPayload): JwtPayload {
    return { 
      id: payload.id, 
      name: payload.name,
      isAdmin: payload.isAdmin || false
    };
  }
}
