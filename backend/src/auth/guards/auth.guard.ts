import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = await this.authService.getUserFromToken(request);

    if (!user) {
      throw new UnauthorizedException('Access token not found or invalid');
    }

    request['user'] = user;

    if (this.isAdminRoute(context) && !user.isAdmin) {
      throw new UnauthorizedException('Admin access required');
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
