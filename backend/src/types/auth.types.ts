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
