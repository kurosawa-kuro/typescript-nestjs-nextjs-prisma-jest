import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  sub: number;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
