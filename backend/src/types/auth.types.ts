// backend\src\types\auth.types.ts

import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarPath: string | null;
  userRoles: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name: string;
}
