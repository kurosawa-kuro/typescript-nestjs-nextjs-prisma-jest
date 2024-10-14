import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/user/user.controller';
import { UserService } from '../../../src/user/user.service';
import { setupTestModule, createMockService } from '../test-utils';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = createMockService(['createUser', 'getAllUsers']);
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

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'testHash',
        isAdmin: false,
        avatarPath: '',
      };
      const expectedResult = {
        id: 1,
        ...userData,
        passwordHash: 'mockedHash',
        isAdmin: false,
        avatarPath: '',
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(expectedResult);

      expect(await controller.createUser(userData)).toBe(expectedResult);
      expect(userService.createUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const expectedResult = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          passwordHash: 'mockedHash',
          isAdmin: false,
          avatarPath: '',
        },
      ];

      jest.spyOn(userService, 'getAllUsers').mockResolvedValue(expectedResult);

      expect(await controller.getAllUsers()).toBe(expectedResult);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });
  });
});
