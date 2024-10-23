import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { BaseService } from '../common/base.service';
import * as bcrypt from 'bcryptjs';
import { UserWithoutPassword, UserInfo } from '../types/auth.types';

@Injectable()
export class UserService extends BaseService<
  UserWithoutPassword,
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

  // Create (C)
  override async create(data: Prisma.UserCreateInput): Promise<UserInfo> {
    try {
      const { password, ...userData } = data;
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: await this.hashPassword(password),
          userRoles: {
            create: {
              role: {
                connectOrCreate: {
                  where: { name: 'general' },
                  create: { name: 'general' },
                },
              },
            },
          },
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return this.mapUserToUserInfo(this.mapUserToUserWithRoles(user));
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // Read (R)
  override async all(): Promise<UserWithoutPassword[]> {
    return this.prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatarPath: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          userRoles: user.userRoles.map((ur) => ur.role.name),
        })),
      );
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserInfo | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (user && (await this.verifyPassword(password, user.password))) {
      return this.mapUserToUserInfo(this.mapUserToUserWithRoles(user));
    }

    return null;
  }

  // Update (U)
  async updateAvatar(id: number, filename: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id },
      data: { avatarPath: filename },
    });
  }

  async updateUserRole(
    id: number,
    action: 'add' | 'remove',
    roleName: string = 'admin',
  ): Promise<UserInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          where: { role: { name: roleName } },
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        userRoles:
          action === 'add'
            ? { create: { role: { connect: { name: roleName } } } }
            : {
                delete: {
                  userId_roleId: {
                    userId: id,
                    roleId: user.userRoles[0].role.id,
                  },
                },
              },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    // Map the updatedUser to match UserWithRoleObjects structure
    const mappedUser: UserWithoutPassword & { userRoles: Role[] } = {
      ...updatedUser,
      userRoles: updatedUser.userRoles.map((ur) => ur.role),
    };

    return this.mapUserToUserInfo(mappedUser);
  }

  // Delete (D)
  // No specific delete method in this service, using the one from BaseService

  // Helper methods

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Todo: パスワードの検証
  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private mapUserToUserWithRoles(
    user: any,
  ): UserWithoutPassword & { userRoles: Role[] } {
    const { password: _, userRoles, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userRoles: userRoles.map((ur) => ur.role),
    };
  }

  mapUserToUserInfo(
    user: UserWithoutPassword & { userRoles: Role[] },
  ): UserInfo {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarPath: user.avatarPath,
      userRoles: user.userRoles.map((role) => role.name),
    };
  }
}
