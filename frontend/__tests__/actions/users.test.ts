import { getUsers, getUserDetails } from '../../src/app/actions/users';
import { ApiClient } from '../../src/services/apiClient';

// ApiClient をモック化
jest.mock('../../src/services/apiClient', () => ({
  ApiClient: {
    get: jest.fn(),
  },
}));

// next/headers の cookies をモック化
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'mocked-jwt-token' })),
  })),
}));

describe('User Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should call ApiClient.get with correct endpoint and return the result', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', avatar_path: 'path/to/avatar1', userRoles: ['user'] },
        { id: '2', name: 'User 2', email: 'user2@example.com', avatar_path: 'path/to/avatar2', userRoles: ['admin'] },
      ];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsers();

      expect(ApiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if ApiClient.get fails', async () => {
      const mockError = new Error('Failed to fetch users');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(getUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUserDetails', () => {
    it('should call ApiClient.get with correct endpoint and return the result', async () => {
      const mockUserDetails = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        avatar_path: 'path/to/avatar1',
        isAdmin: false,
        // Add other fields as necessary
      };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUserDetails);

      const result = await getUserDetails(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/users/1', {
        headers: {
          Authorization: 'Bearer mocked-jwt-token',
        },
      });
      expect(result).toEqual(mockUserDetails);
    });

    it('should return null and log error if ApiClient.get fails', async () => {
      const mockError = new Error('Failed to fetch user details');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);
      console.error = jest.fn();

      const result = await getUserDetails(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/users/1', {
        headers: {
          Authorization: 'Bearer mocked-jwt-token',
        },
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching user details:', mockError);
      expect(result).toBeNull();
    });
  });
});
