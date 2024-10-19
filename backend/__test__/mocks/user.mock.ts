import { User } from '@prisma/client';

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  isAdmin: false,
  avatarPath: '',
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
};

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
});
