// backend\src\types\auth.types.ts

import { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

// UserInfoにUserProfileのavatarPathを追加
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  userRoles: string[];
  profile?: { avatarPath?: string };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name: string;
}

export type UserWithProfile = User & { 
  userRoles: string[];
  profile?: { avatarPath?: string };
}
