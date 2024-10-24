import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/features/user/user.service';
import { PrismaService } from '@/core/database/prisma.service';
import { UserWithoutPassword, UserInfo } from '@/shared/types/auth.types';
import { User, Prisma, Role } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockCreatedUser } from '../../../mocks/user.mock';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            userProfile: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // Existing tests...

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUserData: Prisma.UserCreateInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await userService.create(mockUserData);

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['general'],
        profile: {
          avatarPath: 'default.png',
        },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const mockUserData: Prisma.UserCreateInput = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(userService.create(mockUserData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('all', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [{ role: { name: 'general' } }],
          profile: { avatarPath: 'avatar.jpg' },
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [{ role: { name: 'admin' } }],
          profile: { avatarPath: 'avatar.jpg' },
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.all();

      expect(result).toEqual([
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          userRoles: ['general'],
          profile: {
            avatarPath: 'avatar.jpg',
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          userRoles: ['admin'],
          profile: {
            avatarPath: 'avatar.jpg',
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('validateUser', () => {
    it('should return user info if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await userService['hashPassword']('password123'),
        avatarPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { name: 'general' } }],
        profile: { avatarPath: null },
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          avatarPath: 'default.png',
        },
        userRoles: ['general'],
      });
    });

    it('should return null if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await userService['hashPassword']('correctpassword'),
        avatarPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { name: 'general' } }],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'old-avatar.jpg' },
      };

      const updatedUser = {
        ...mockUser,
        profile: { avatarPath: 'new-avatar.jpg' },
      };

      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      (prismaService.userProfile.update as jest.Mock).mockResolvedValue({ avatarPath: 'new-avatar.jpg' });

      const result = await userService.updateAvatar(1, 'new-avatar.jpg');

      expect(result).toEqual(updatedUser);
      expect(prismaService.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { avatarPath: 'new-avatar.jpg' },
      });
    });

    it('should create profile if it doesn\'t exist', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: null,
      };

      const updatedUser = {
        ...mockUser,
        profile: { avatarPath: 'new-avatar.jpg' },
      };

      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      (prismaService.userProfile.create as jest.Mock).mockResolvedValue({ avatarPath: 'new-avatar.jpg' });

      const result = await userService.updateAvatar(1, 'new-avatar.jpg');

      expect(result).toEqual(updatedUser);
      expect(prismaService.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          avatarPath: 'new-avatar.jpg',
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateAvatar(999, 'new-avatar.jpg')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserRole', () => {
    it('should add admin role to user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: null },
        userRoles: [],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        userRoles: [{ role: { name: 'admin' } }],
      });

      const result = await userService.updateUserRole(1, 'add', 'admin');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          avatarPath: 'default.png',
        },
        userRoles: ['admin'],
      });
    });

    it('should remove admin role from user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: null },
        userRoles: [{ role: { id: 2, name: 'admin' } }],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        userRoles: [],
      });

      const result = await userService.updateUserRole(1, 'remove', 'admin');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          avatarPath: 'default.png',
        },
        userRoles: [],
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUserRole(999, 'add', 'admin')).rejects.toThrow(NotFoundException);
    });
  });
});
