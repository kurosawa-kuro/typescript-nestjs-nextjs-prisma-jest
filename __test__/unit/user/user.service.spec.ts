import { UserService } from '../../../src/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { createMockPrismaService, setupTestModule } from '../test-utils';
import { User, Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await setupTestModule(
      [],
      [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    );

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData: Omit<User, 'id'> = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedUser: User = { id: 1, ...userData };

      (prismaService.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.create(userData);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });
  });

  describe('all', () => {
    it('should return all users', async () => {
      const expectedUsers: User[] = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          isAdmin: false,
          avatarPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          isAdmin: true,
          avatarPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(expectedUsers);

      const result = await userService.all();
      expect(result).toEqual(expectedUsers);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a user if found', async () => {
      const expectedUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.find(1);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.find(1)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findBy', () => {
    it('should return a user if found', async () => {
      const expectedUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.findBy({ email: 'test@example.com' });
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.findBy({ email: 'nonexistent@example.com' })).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findFirst', () => {
    it('should return a user if found', async () => {
      const expectedUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.findFirst({ name: 'Test User' });
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test User' },
      });
    });

    it('should throw NotFoundException if no user found', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(userService.findFirst({ name: 'Non-existent User' })).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { name: 'Non-existent User' },
      });
    });
  });

  describe('update', () => {
    it('should update and return the user if found', async () => {
      const userId = 1;
      const updateData: Partial<User> = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedUser: User = {
        id: userId,
        name: 'Updated Name',
        email: 'updated@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.update(userId, updateData);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it('should throw NotFoundException if user not found during update', async () => {
      const userId = 1;
      const updateData: Partial<User> = {
        name: 'Updated Name',
      };

      (prismaService.user.update as jest.Mock).mockRejectedValue(new Error('User not found'));

      await expect(userService.update(userId, updateData)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });
  });

  describe('destroy', () => {
    it('should delete and return the user if found', async () => {
      const userId = 1;
      const deletedUser: User = {
        id: userId,
        name: 'Deleted User',
        email: 'deleted@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.user.delete as jest.Mock).mockResolvedValue(deletedUser);

      const result = await userService.destroy(userId);
      expect(result).toEqual(deletedUser);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException if user not found during delete', async () => {
      const userId = 1;

      (prismaService.user.delete as jest.Mock).mockRejectedValue(new Error('User not found'));

      await expect(userService.destroy(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
