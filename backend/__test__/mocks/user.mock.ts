import { UserInfo } from '../../src/shared/types/auth.types';

export const mockUser: UserInfo = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  userRoles: ['general'],
  profile: {
    avatarPath: '/path/to/avatar.jpg',
  },
};

export const createMockUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  ...mockUser,
  ...overrides,
});
