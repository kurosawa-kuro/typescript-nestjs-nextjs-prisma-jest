import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { setupTestModule, createMockService } from '../test-utils';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = createMockService(['create', 'getAllWithoutPassword']);
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
        password: 'testHash',
        isAdmin: false,
        avatarPath: '',
        createdAt: new Date(),
        updatedAt: new Date(),
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
    it('should return an array of users without passwords', async () => {
      const expectedResult: Omit<User, 'password'>[] = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          isAdmin: false,
          avatarPath: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(userService, 'getAllWithoutPassword').mockResolvedValue(expectedResult);

      expect(await controller.index()).toBe(expectedResult);
      expect(userService.getAllWithoutPassword).toHaveBeenCalled();
    });
  });
});
