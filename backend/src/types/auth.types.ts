import { User, Role } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export type UserWithStringRoles = UserWithoutPassword & {
  userRoles: string[];
};

export type UserWithRoleObjects = UserWithoutPassword & {
  userRoles: Role[];
};

// Todo: TokenUserに変更
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  userRoles: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  name: string;
}
