import { UserService } from '../../../src/user/user.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { createMockPrismaService, setupTestModule } from '../test-utils';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await setupTestModule(
      [],
      [
        UserService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    );

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hash',
        isAdmin: false,
        avatarPath: '',
      };
      const expectedUser = { id: 1, ...userData };

      (prismaService.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.createUser(userData);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          passwordHash: 'hash1',
          isAdmin: false,
          avatarPath: '',
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          passwordHash: 'hash2',
          isAdmin: true,
          avatarPath: '',
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(
        expectedUsers,
      );

      const result = await userService.getAllUsers();
      expect(result).toEqual(expectedUsers);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });
});
