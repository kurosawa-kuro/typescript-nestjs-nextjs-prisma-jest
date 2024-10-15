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

export interface SignupDto extends SigninDto {
  name: string;
}
