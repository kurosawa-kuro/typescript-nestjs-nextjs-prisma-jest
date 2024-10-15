import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

interface SigninParams {
    email: string;
    passwordHash: string;
  }

  interface SignupParams {
    email: string;
    passwordHash: string;
  }

@Injectable()
export class AuthService {
    
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService
  ) {}

  async register({ email, passwordHash }: SignupParams) {
    const hashedPassword = await bcrypt.hash(passwordHash, 10);
    const user = await this.prismaService.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: email.split('@')[0], // Use part of email as default name
      },
    });

    return this.generateJWT(user.name, user.id);
  }

  async signin({ email, passwordHash }: SigninParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    const hashedPassword = user.passwordHash;

    const isValidPassword = await bcrypt.compare(passwordHash, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }

    return this.generateJWT(user.name, user.id);
  }

  async logout() {
    return { message: 'User logged out successfully' };
  }

  async me() {
    return { message: 'User information retrieved successfully' };
  }

  private generateJWT(name: string, id: number) {
    return this.jwtService.sign(
      {
        name,
        id,
      },
      {
        secret: 'secretKey',
        expiresIn: '1h',
      },
    );
  }
}
