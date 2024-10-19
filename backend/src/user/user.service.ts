import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Prisma } from '@prisma/client';
import { BaseService } from '../common/base.service';
import * as bcrypt from 'bcryptjs';
import { UserInfo } from '../types/auth.types';

// 新しい型を定義
type UserWithoutPassword = Omit<User, 'password'>;
type UserWithRoles = UserWithoutPassword & {
  userRoles: string[];
};

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

      return this.mapUserToUserInfo(user);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // Read (R)
  override async all(): Promise<UserWithRoles[]> {
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

  async validateUser(email: string, password: string): Promise<User | null> {
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

    if (userWithRoles) {
      const user = {
        ...userWithRoles,
        userRoles: userWithRoles.userRoles.map(ur => ur.role.name)
      };
      console.log('validateUseruser', user);
      return user;
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

  // Delete (D)
  // No specific delete method in this service, using the one from BaseService

  // Helper methods
  mapUserToUserInfo(user: any): any {
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

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
