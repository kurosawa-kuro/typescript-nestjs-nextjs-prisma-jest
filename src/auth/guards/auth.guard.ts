import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { JwtAuthService } from '../jwt-auth.service';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtAuthService: JwtAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    try {
      const user = await this.jwtAuthService.getUserFromToken(request);
      request['user'] = user;

      if (this.isAdminRoute(context) && !user.isAdmin) {
        throw new UnauthorizedException('Admin access required');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
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
}
