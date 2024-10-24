import { User, UserRole, Role } from '@prisma/client';

interface MockUser extends Omit<User, 'userRoles'> {
  profile: {
    avatarPath: string;
  };
  userRoles: {
    role: Role;
  }[];
}

export const mockUser: MockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  profile: {
    avatarPath: '/path/to/avatar.jpg',
  },
  userRoles: [
    {
      role: {
        id: 1,
        name: 'general',
        description: 'Regular user role',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
      }
    }
  ],
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
};

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  ...mockUser,
  ...overrides,
});
