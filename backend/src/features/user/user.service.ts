import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { BaseService } from '@/core/common/base.service';
import * as bcrypt from 'bcryptjs';
import { UserWithoutPassword, UserInfo, UserDetails } from '@/shared/types/auth.types';

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
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              avatarPath: true,
            },
          },
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
          profile: { avatarPath: user.profile?.avatarPath || 'default.png' },
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
        profile: true,
      },
    });

    if (user && (await this.verifyPassword(password, user.password))) {
      return this.mapUserToUserInfo({
        ...this.mapUserToUserWithRoles(user),
        profile: user.profile,
      });
    }

    return null;
  }

  // Update (U)
  async updateAvatar(id: number, filename: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId: id },
        data: { avatarPath: filename },
      });
    } else {
      await this.prisma.userProfile.create({
        data: {
          userId: id,
          avatarPath: filename,
        },
      });
    }
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
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
            : { deleteMany: { roleId: user.userRoles[0].role.id, userId: id } },
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
    user: UserWithoutPassword & {
      userRoles: Role[];
      profile?: { avatarPath?: string };
    },
  ): UserInfo {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: { avatarPath: user.profile?.avatarPath || 'default.png' },
      userRoles: user.userRoles.map((role) => role.name),
    };
  }

  async findByIdWithRelations(
    id: number,
  ): Promise<UserWithoutPassword & { userRoles: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            avatarPath: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userRoles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async findAllWithFollowStatus(currentUserId: number): Promise<UserDetails[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            avatarPath: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        followers: {
          where: {
            followerId: currentUserId,
          },
        },
      },
    });

    return users.map((user): UserDetails => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      userRoles: user.userRoles.map(ur => ur.role.name),
      profile: { avatarPath: user.profile?.avatarPath || 'default.png' },
      isFollowing: user.followers.length > 0,
    }));
  }
}
