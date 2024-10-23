// backend\src\types\auth.types.ts

import { User, Role } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export type UserWithStringRoles = UserWithoutPassword & {
  userRoles: string[];
};

export type UserWithRoleObjects = UserWithoutPassword & {
  userRoles: Role[];
};

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatarPath: string | null;
  userRoles?: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name: string;
}

export type UserWithRoles = UserWithoutPassword & { userRoles: string[] };
