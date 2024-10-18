import { getUsers } from '../../src/app/actions/users';
import { ApiClient } from '../../src/services/apiClient';

// ApiClient をモック化
jest.mock('../../src/services/apiClient', () => ({
  ApiClient: {
    get: jest.fn(),
  },
}));

describe('User Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should call ApiClient.get with correct endpoint and return the result', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', avatar_path: 'path/to/avatar1', isAdmin: false },
        { id: '2', name: 'User 2', email: 'user2@example.com', avatar_path: 'path/to/avatar2', isAdmin: true },
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
});
