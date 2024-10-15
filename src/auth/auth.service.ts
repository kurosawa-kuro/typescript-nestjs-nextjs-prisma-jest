import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtAuthService } from './jwt-auth.service';
import { SigninDto, SignupDto, UserInfo } from '../types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtAuthService: JwtAuthService,
  ) {}

  async register(signupDto: SignupDto): Promise<string> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email: signupDto.email,
        name: signupDto.name,
        passwordHash: hashedPassword,
      },
    });

    return this.jwtAuthService.signToken(this.mapUserToJwtPayload(user));
  }

  async signin(signinDto: SigninDto): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: { email: signinDto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new InternalServerErrorException('User password hash is missing');
    }

    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.jwtAuthService.signToken(this.mapUserToJwtPayload(user));
  }

  private mapUserToJwtPayload(user: UserInfo) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }
}
