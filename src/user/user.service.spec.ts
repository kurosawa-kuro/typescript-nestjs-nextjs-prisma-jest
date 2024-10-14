import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', passwordHash: 'hash', isAdmin: false, avatarPath: '' };
      const expectedUser = { id: 1, ...userData };
      
      (prismaService.user.create as jest.Mock).mockResolvedValue(expectedUser);

      const result = await userService.createUser(userData);
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({ data: userData });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const expectedUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', passwordHash: 'hash1', isAdmin: false, avatarPath: '' },
        { id: 2, name: 'User 2', email: 'user2@example.com', passwordHash: 'hash2', isAdmin: true, avatarPath: '' },
      ];
      
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(expectedUsers);

      const result = await userService.getAllUsers();
      expect(result).toEqual(expectedUsers);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });
  });
});
