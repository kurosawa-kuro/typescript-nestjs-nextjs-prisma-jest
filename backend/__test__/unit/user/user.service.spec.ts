import { UserService } from '../../../src/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { setupTestModule } from '../test-utils';
import { User } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Add this type definition
type CreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hash',
    isAdmin: false,
    avatarPath: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  describe('createUser', () => {
    it('should create a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 1,
        ...registerDto,
        password: hashedPassword,
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      (prismaService.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await userService.create(registerDto);

      expect(result).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        isAdmin: createdUser.isAdmin,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: registerDto.email,
          name: registerDto.name,
          password: hashedPassword,
          isAdmin: false,
        }),
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const registerDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] }
      });

      await expect(userService.create(registerDto)).rejects.toThrow(BadRequestException);
      await expect(userService.create(registerDto)).rejects.toThrow('Email already exists');
    });

    it('should throw the original error for other errors', async () => {
      const registerDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      const originalError = new Error('Some other error');
      (prismaService.user.create as jest.Mock).mockRejectedValue(originalError);

      await expect(userService.create(registerDto)).rejects.toThrow(originalError);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const password = 'password123';
      const hashedPassword = 'hashedPassword123';
      const user = { ...mockUser, password: hashedPassword };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await userService.validateUser(mockUser.email, password);

      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await userService.validateUser(mockUser.email, 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('mapUserToUserInfo', () => {
    it('should map User to UserInfo', () => {
      const result = userService.mapUserToUserInfo(mockUser);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
      });
    });

    it('should set isAdmin to false if not provided', () => {
      const userWithoutAdmin = { ...mockUser, isAdmin: undefined };
      const result = userService.mapUserToUserInfo(userWithoutAdmin);

      expect(result.isAdmin).toBe(false);
    });
  });
});
