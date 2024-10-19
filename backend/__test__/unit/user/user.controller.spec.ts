import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { setupTestModule, createMockService } from '../test-utils';
import { User } from '@prisma/client';
import { mockUser, createMockUser } from '../../mocks/user.mock';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = createMockService(['create', 'all']);
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
});
