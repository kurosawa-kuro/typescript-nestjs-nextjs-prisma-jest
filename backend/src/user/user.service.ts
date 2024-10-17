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

  // base.serviceのcreateをオーバーライドする
  // 引数はRegisterDtoを受け取る
  // passwordHashを生成して、dataにpasswordHashを追加する
  // ユーザーを作成する
  // パスワードを除いたユーザーデータを返す




  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(
      password,
      user.passwordHash,
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
  async getAllWithoutPassword(): Promise<Omit<User, 'passwordHash'>[]> {
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

  // Add this method to handle registration
  // async register(registerDto: RegisterDto): Promise<User> {
  //   return this.create({
  //     email: registerDto.email,
  //     name: registerDto.name,
  //     password: registerDto.password,
  //   });
  // }

  override async create(data: Prisma.UserCreateInput & { password: string }): Promise<Partial<User>> {
    const { password, ...userData } = data;
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: await this.hashPassword(password),
        isAdmin: false,
      },
    });

    return this.mapUserToUserInfo(user);
  }
}
