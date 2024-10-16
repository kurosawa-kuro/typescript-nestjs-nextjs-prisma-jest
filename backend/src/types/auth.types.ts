export interface UserInfo {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface SigninDto {
  email: string;
  password: string;
}

export interface RegisterDto extends SigninDto {
  name: string;
}
