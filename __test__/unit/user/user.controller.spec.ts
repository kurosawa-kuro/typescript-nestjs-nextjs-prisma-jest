import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { setupTestModule, createMockService } from '../test-utils';
import { User } from '@prisma/client';

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
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'testHash',
        isAdmin: false,
        avatarPath: '',
      };
      const expectedResult: User = {
        id: 1,
        ...userData,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(expectedResult);

      expect(await controller.create(userData)).toBe(expectedResult);
      expect(userService.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('index', () => {
    it('should return an array of users', async () => {
      const expectedResult: User[] = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          passwordHash: 'mockedHash',
          isAdmin: false,
          avatarPath: '',
        },
      ];

      jest.spyOn(userService, 'all').mockResolvedValue(expectedResult);

      expect(await controller.index()).toBe(expectedResult);
      expect(userService.all).toHaveBeenCalled();
    });
  });
});
