import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { setupTestModule, createMockService } from '../test-utils';
import { User } from '@prisma/client';
import { mockUser, createMockUser } from '../../mocks/user.mock';
import { ParseIntPipe } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = createMockService(['create', 'all', 'updateAvatar']);
    const module = await setupTestModule(
      [UserController],
      [{ provide: UserService, useValue: mockUserService }],
    );

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData: Omit<User, 'id'> = {
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        isAdmin: mockUser.isAdmin,
        avatarPath: mockUser.avatarPath,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };
      const expectedResult: User = mockUser;

      jest.spyOn(userService, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(userData)).toBe(expectedResult);
      expect(userService.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('index', () => {
    it('should return an array of users without passwords', async () => {
      const expectedResult: User[] = [mockUser];

      jest.spyOn(userService, 'all').mockResolvedValue(expectedResult);

      expect(await controller.index()).toBe(expectedResult);
      expect(userService.all).toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const userId = 1;
      const filename = 'new-avatar.jpg';
      const mockFile = {
        filename: filename,
      } as Express.Multer.File;

      const updatedUser: User = {
        ...mockUser,
        avatarPath: filename,
      };

      jest.spyOn(userService, 'updateAvatar').mockResolvedValue(updatedUser);

      const result = await controller.updateAvatar(userId, mockFile);

      expect(result).toEqual(updatedUser);
      expect(userService.updateAvatar).toHaveBeenCalledWith(userId, filename);
    });

    it('should throw an error if file is not provided', async () => {
      const userId = 1;

      await expect(controller.updateAvatar(userId, undefined)).rejects.toThrow();
    });
  });
});
