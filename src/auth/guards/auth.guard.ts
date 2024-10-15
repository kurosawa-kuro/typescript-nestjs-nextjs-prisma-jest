import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthService, UserPayload } from '../jwt-auth.service';

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
    const token = this.jwtAuthService.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = await this.jwtAuthService.verifyToken(token);
      const user = await this.getUserFromPayload(payload);
      request['user'] = this.jwtAuthService.extractUserInfo(payload);

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

  private async getUserFromPayload(payload: UserPayload) {
    return this.prismaService.user.findUnique({ where: { id: payload.id } });
  }
}
