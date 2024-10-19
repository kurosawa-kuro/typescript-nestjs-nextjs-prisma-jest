import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, UserInfo } from '../types/auth.types';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { Prisma, Role, User } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;
type UserWithStringRoles = UserWithoutPassword & {
  userRoles: string[];
};

type UserWithRoleObjects = UserWithoutPassword & {
  userRoles: Role[];
};

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'JWT_SECRET';
  }

  // Authentication methods
  async register(
    data: Prisma.UserCreateInput,
  ): Promise<{ token: string; user: UserInfo }> {
    const user = await this.userService.create(data);
    const userInfo = this.userService.mapUserToUserInfo(user as any);
    const token = await this.jwtService.signAsync(userInfo, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });
    return { token, user: userInfo };
  }

  async login(LoginDto: LoginDto): Promise<{ token: string; user: Omit<UserInfo, 'password'> }> {
    const user = await this.userService.validateUser(
      LoginDto.email,
      LoginDto.password,
    );
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    console.log('login user', user);
    const userWithRoles = await this.userService.getUserWithRoles(user.id);
    const userInfo = {
      ...userWithRoles,
      userRoles: userWithRoles.userRoles.map(role => role.name)
    };
    const token = await this.signToken(userInfo as UserInfo);
    return { token, user: userInfo };
  }

  async logout(res: Response) {
    this.clearTokenCookie(res);
    return { message: 'Logout successful' };
  }

  async getUserFromToken(request: Request): Promise<UserInfo> {
    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return await this.verifyToken(token);
  }

  // Token management methods
  private async signToken(payload: UserInfo): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '1d',
    });
  }

  private async verifyToken(token: string): Promise<UserInfo> {
    return await this.jwtService.verifyAsync<UserInfo>(token, {
      secret: this.jwtSecret,
    });
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    return (
      request.cookies['jwt'] || request.headers.authorization?.split(' ')[1]
    );
  }

  setTokenCookie(res: Response, token: string): void {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  clearTokenCookie(res: Response): void {
    res.clearCookie('jwt');
  }
}
