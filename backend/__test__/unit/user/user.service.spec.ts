import { UserService } from '../../../src/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { createMockPrismaService, setupTestModule } from '../test-utils';
import { User, Prisma } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../../src/common/base.service';
import * as bcrypt from 'bcryptjs';

type UserId = string | number;

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

      const result = await userService.findById(1);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.findById(1)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const id = 1;
      const mockUser = { id, name: 'Test User' };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findById(id);
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException if user not found', async () => {
      const id = 999;
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.findById(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id } });
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
    it('should update and return the user', async () => {
      const id = 1;
      const updateData = { name: 'Updated Name' };
      const updatedUser = { id, ...updateData };
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.update(id, updateData);
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const id = 999;
      const updateData = { name: 'Updated Name' };
      (prismaService.user.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

      await expect(userService.update(id, updateData)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });

    it('should throw the original error for non-P2025 errors', async () => {
      const id = 1;
      const updateData = { name: 'Updated Name' };
      const originalError = new Error('Database error');
      (prismaService.user.update as jest.Mock).mockRejectedValue(originalError);

      await expect(userService.update(id, updateData)).rejects.toThrow(originalError);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });
  });

  describe('destroy', () => {
    it('should delete the user', async () => {
      const id = 1;
      (prismaService.user.delete as jest.Mock).mockResolvedValue(undefined);

      await userService.destroy(id);
      expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException if user not found', async () => {
      const id = 999;
      // Change this line
      (prismaService.user.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'User not found'
      });

      await expect(userService.destroy(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('handleNotFound', () => {
    it('should throw NotFoundException with correct message', () => {
      const id = 1;
      expect(() => {
        (userService as any).handleNotFound(id);
      }).toThrow(NotFoundException);
      expect(() => {
        (userService as any).handleNotFound(id);
      }).toThrow(`User with ID ${id} not found`);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const createdUser = { ...registerDto, id: 1, passwordHash: hashedPassword };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await userService.createUser(registerDto);

      expect(result).toEqual(createdUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          passwordHash: hashedPassword,
        },
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const registerDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(userService.createUser(registerDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const user = { id: 1, email, passwordHash: hashedPassword };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await userService.validateUser(email, password);

      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.validateUser(email, password);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';
      const user = { id: 1, email, passwordHash: hashedPassword };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await userService.validateUser(email, password);

      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });

  describe('mapUserToUserInfo', () => {
    it('should map User to UserInfo', () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: true,
        avatarPath: 'path/to/avatar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = userService.mapUserToUserInfo(user);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    });

    it('should set isAdmin to false if not provided', () => {
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: 'path/to/avatar',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = userService.mapUserToUserInfo(user);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: false,
      });
    });
  });
});
