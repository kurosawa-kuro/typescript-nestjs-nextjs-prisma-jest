import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthService, UserPayload } from '../jwt-auth.service';
import { UserInfo } from '../decorators/user.decorator';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtAuthService: JwtAuthService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = await this.jwtAuthService.getUserFromToken(request);

    if (!user) {
      throw new UnauthorizedException('Access token not found or invalid');
    }

    request['user'] = user as UserInfo;

    if (this.isAdminRoute(context)) {
      const dbUser = await this.prismaService.user.findUnique({ where: { id: user.id } });
      if (!dbUser?.isAdmin) {
        throw new UnauthorizedException('Admin access required');
      }
    }

    return true;
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
}
