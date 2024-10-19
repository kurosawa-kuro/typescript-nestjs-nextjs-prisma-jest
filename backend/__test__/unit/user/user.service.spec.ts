import { UserService } from '../../../src/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { setupTestModule } from '../test-utils';
import { User } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { mockUser, createMockUser } from '../../mocks/user.mock';

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
    const registerDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
    });

    it('should create a new user', async () => {
      const createdUser = {
        id: 1,
        ...registerDto,
        password: hashedPassword,
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] }
      });

      await expect(userService.create(registerDto)).rejects.toThrow(BadRequestException);
      await expect(userService.create(registerDto)).rejects.toThrow('Email already exists');
    });

    it('should throw the original error for other errors', async () => {
      const originalError = new Error('Some other error');
      (prismaService.user.create as jest.Mock).mockRejectedValue(originalError);

      await expect(userService.create(registerDto)).rejects.toThrow(originalError);
    });
  });

  describe('validateUser', () => {
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';

    it('should return user if credentials are valid', async () => {
      const user = createMockUser({ password: hashedPassword });
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await userService.validateUser(mockUser.email, password);

      expect(result).toEqual(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: mockUser.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.validateUser('nonexistent@example.com', password);

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

  describe('updateAvatar', () => {
    const userId = 1;
    const filename = 'new-avatar.jpg';

    it('should update user avatar path', async () => {
      const updatedUser = { ...mockUser, avatarPath: filename };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateAvatar(userId, filename);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarPath: filename },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateAvatar(userId, filename)).rejects.toThrow(NotFoundException);
      await expect(userService.updateAvatar(userId, filename)).rejects.toThrow('User not found');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw an error if update fails', async () => {
      const updateError = new Error('Update failed');
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockRejectedValue(updateError);

      await expect(userService.updateAvatar(userId, filename)).rejects.toThrow(updateError);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarPath: filename },
      });
    });
  });
});
