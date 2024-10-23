import { UserService } from '../../../src/user/user.service';
import { UserWithoutPassword  } from '../../../src/types/auth.types';
import { User, Prisma, Role } from '@prisma/client';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(null);
  });

  describe('mapUserToUserInfo', () => {
    it('should map user to user info', () => {
      const mockUser: UserWithoutPassword & { userRoles: Role[] } = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        avatarPath: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            id: 1,
            name: 'general',
            description: 'General user role',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const result = userService.mapUserToUserInfo(mockUser);

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatarPath: mockUser.avatarPath,
        userRoles: ['general'],
      });
    });

    it('should map user without admin role', () => {
      const userWithoutAdmin: UserWithoutPassword & { userRoles: Role[] } = {
        id: 2,
        name: 'Non-Admin User',
        email: 'nonadmin@example.com',
        avatarPath: 'nonadmin-avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            id: 1,
            name: 'general',
            description: 'General user role',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const result = userService.mapUserToUserInfo(userWithoutAdmin);

      expect(result).toEqual({
        id: userWithoutAdmin.id,
        name: userWithoutAdmin.name,
        email: userWithoutAdmin.email,
        avatarPath: userWithoutAdmin.avatarPath,
        userRoles: ['general'],
      });
      expect(result.userRoles).not.toContain('admin');
    });
  });

  // ... その他のテスト ...
});
