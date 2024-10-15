import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma } from '@prisma/client';
import { BaseService } from '../common/base.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, UserInfo } from '../types/auth.types';

@Injectable()
export class UserService extends BaseService<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput
> {
  protected entityName = 'User';

  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected getRepository() {
    return this.prisma.user;
  }

  async createUser(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    return await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        passwordHash: hashedPassword,
      },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  mapUserToUserInfo(user: User): UserInfo {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
