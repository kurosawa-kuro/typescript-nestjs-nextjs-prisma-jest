export interface UserInfo {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface SigninDto {
  email: string;
  password: string; // Changed from passwordHash to password
}

export interface SignupDto extends SigninDto {
  name: string;
}
