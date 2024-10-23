import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  userRoles: string[];
  avatarPath: string;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
