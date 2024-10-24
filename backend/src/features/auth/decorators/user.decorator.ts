import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '@/shared/types/auth.types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
