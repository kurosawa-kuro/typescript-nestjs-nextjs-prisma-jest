import { UserController } from '@/features/user/user.controller';
import { UserService } from '@/features/user/user.service';
import { setupTestModule, createMockService } from '../../test-utils';
import { mockUser  } from '../../../mocks/user.mock';
import { UserInfo, UserWithoutPassword, UserWithProfile } from '@/shared/types/auth.types';

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
    it('should create a new user', async () => {
      const mockUser: UserWithoutPassword = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResult: UserInfo = {
        ...mockUser,
        userRoles: ['general'],
      };

      const createUserDto = {
        name: mockUser.name,
        email: mockUser.email,
        password: 'password123',
      };

      jest.spyOn(userService, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(createUserDto)).toBe(expectedResult);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('index', () => {
    it('should return an array of users without passwords', async () => {
      const expectedResult: UserWithoutPassword[] = [
        {
          ...mockUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

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

      const updatedUser: UserWithProfile = {
        ...mockUser,
        password: 'mockPassword', // Add this line
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['general'], // Add this line
        profile: { avatarPath: filename },
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
