import { UserInfo, UserWithProfile } from '../../src/shared/types/auth.types';

export const mockUser: UserWithProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword123',
  userRoles: ["general"],
  createdAt: new Date(),
  updatedAt: new Date(),
  profile: {
    avatarPath: '',
  },
};

export const mockUserInfo: UserInfo = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  userRoles: ["general"],
  profile: {
    avatarPath: "kevin_avatar.png",
  },
};

export const createMockUser = (overrides: Partial<UserWithProfile> = {}): UserWithProfile => ({
  ...mockUser,
  ...overrides,
});

export const createMockUserInfo = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  ...mockUserInfo,
  ...overrides,
});
