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

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(
      password,
      user.password,
    );

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

    // Todo: allをオーバーライドする
  async getAllWithoutPassword(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        avatarPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  override async create(data: Prisma.UserCreateInput): Promise<Partial<User>> {
    try {
      const { password, ...userData } = data;
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: await this.hashPassword(password),
          isAdmin: false,
        },
      });

      return this.mapUserToUserInfo(user);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }
}
