import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { BaseService } from '../common/base.service';
import * as bcrypt from 'bcryptjs';
import { UserInfo } from '../types/auth.types';

// 新しい型を定義
type UserWithoutPassword = {
  id: number;
  name: string;
  email: string;
  avatarPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserWithStringRoles = UserWithoutPassword & {
  userRoles: string[];
};

type UserWithRoleObjects = UserWithoutPassword & {
  userRoles: Role[];
};

type UserWithRoles = Omit<User, 'password'> & { userRoles: string[] };

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
  override async create(data: Prisma.UserCreateInput): Promise<Partial<User>> {
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
                  create: { name: 'general' }
                }
              }
            }
          }
        },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });

      console.log('create user', user);

      return this.mapUserToUserInfo({
        ...user,
        userRoles: user.userRoles.map(ur => ur.role)
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // Read (R)
  override async all(): Promise<UserWithStringRoles[]> {
    return this.prisma.user.findMany({
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
                name: true
              }
            }
          }
        }
      }
    }).then(users => users.map(user => ({
      ...user,
      userRoles: user.userRoles.map(ur => ur.role.name)
    })));
  }

  async validateUser(email: string, password: string): Promise<UserWithRoles | null> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (userWithRoles && await this.verifyPassword(password, userWithRoles.password)) {
      const { password: _, ...userWithoutPassword } = userWithRoles;
      return {
        ...userWithoutPassword,
        userRoles: userWithRoles.userRoles.map(ur => ur.role.name)
      };
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

  async updateUserRole(id: number, action: 'add' | 'remove', roleName: string = 'admin'): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          where: { role: { name: roleName } },
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (action === 'add' && user.userRoles.length > 0) {
      return user; // User already has the role
    }

    if (action === 'remove' && user.userRoles.length === 0) {
      return user; // User doesn't have the role
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        userRoles: action === 'add'
          ? { create: { role: { connect: { name: roleName } } } }
          : { delete: { userId_roleId: { userId: id, roleId: user.userRoles[0].role.id } } }
      },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });
  }

  // Delete (D)
  // No specific delete method in this service, using the one from BaseService

  // Helper methods
  mapUserToUserInfo(user: UserWithRoleObjects): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userRoles: user.userRoles.map(ur => ur)
    };
  }

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

  async getUserWithRoles(userId: number): Promise<UserWithRoleObjects> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        userRoles: {
          include: {
            role: true
          }
        }
      },
    });

    if (!userWithRoles) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = userWithRoles;
    console.log('getUserWithRoles userWithoutPassword', userWithoutPassword);
    return {
      ...userWithoutPassword,
      userRoles: userWithRoles.userRoles.map(ur => ur.role)
    };
  }
}
