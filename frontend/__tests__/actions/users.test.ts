import { getUsers, getUserDetails, getUsersWithFollowStatus, followUser, unfollowUser, getFollowers, getFollowing, getMe } from '../../src/app/actions/users';
import { ApiClient } from '../../src/services/apiClient';

// ApiClient をモック化
jest.mock('../../src/services/apiClient', () => ({
  ApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
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
    it('should call ApiClient.get with correct endpoint, headers and return the result', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', avatar_path: 'path/to/avatar1', userRoles: ['user'] },
        { id: '2', name: 'User 2', email: 'user2@example.com', avatar_path: 'path/to/avatar2', userRoles: ['admin'] },
      ];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsers();

      expect(ApiClient.get).toHaveBeenCalledWith('/users', {
        headers: {
          Authorization: 'Bearer mocked-jwt-token',
        },
      });
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

  describe('getUsersWithFollowStatus', () => {
    it('should call ApiClient.get with correct endpoint and headers', async () => {
      const mockUsers = [{ id: '1', name: 'User 1', isFollowing: true }];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersWithFollowStatus();

      expect(ApiClient.get).toHaveBeenCalledWith('/users/with-follow-status', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('followUser', () => {
    it('should call ApiClient.post with correct endpoint and headers', async () => {
      const mockResponse = [{ id: '1', name: 'User 1', isFollowing: true }];
      (ApiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await followUser(1);

      expect(ApiClient.post).toHaveBeenCalledWith('/users/1/follow', {}, {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if ApiClient.post fails', async () => {
      const mockError = new Error('Failed to follow user');
      (ApiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(followUser(1)).rejects.toThrow('Failed to follow user');
    });
  });

  describe('unfollowUser', () => {
    it('should call ApiClient.delete with correct endpoint and headers', async () => {
      const mockResponse = [{ id: '1', name: 'User 1', isFollowing: false }];
      (ApiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await unfollowUser(1);

      expect(ApiClient.delete).toHaveBeenCalledWith('/users/1/follow', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if ApiClient.delete fails', async () => {
      const mockError = new Error('Failed to unfollow user');
      (ApiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(unfollowUser(1)).rejects.toThrow('Failed to unfollow user');
    });
  });

  describe('getFollowers', () => {
    it('should call ApiClient.get with correct endpoint and headers', async () => {
      const mockFollowers = [{ id: '2', name: 'Follower 1' }];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockFollowers);

      const result = await getFollowers(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/users/1/followers', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockFollowers);
    });

    it('should throw an error if ApiClient.get fails', async () => {
      const mockError = new Error('Failed to fetch followers');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(getFollowers(1)).rejects.toThrow('Failed to fetch followers');
    });
  });

  describe('getFollowing', () => {
    it('should call ApiClient.get with correct endpoint and headers', async () => {
      const mockFollowing = [{ id: '3', name: 'Following 1' }];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockFollowing);

      const result = await getFollowing(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/users/1/following', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockFollowing);
    });

    it('should throw an error if ApiClient.get fails', async () => {
      const mockError = new Error('Failed to fetch following users');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(getFollowing(1)).rejects.toThrow('Failed to fetch following users');
    });
  });

  describe('getMe', () => {
    it('should call ApiClient.get with correct endpoint and headers and return user details', async () => {
      const mockUserDetails = {
        id: 1,
        name: 'Current User',
        email: 'current@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['user'],
        profile: { avatarPath: 'path/to/avatar' }
      };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUserDetails);

      const result = await getMe();

      expect(ApiClient.get).toHaveBeenCalledWith('/auth/me', {
        headers: {
          Authorization: 'Bearer mocked-jwt-token',
        },
      });
      expect(result).toEqual(mockUserDetails);
    });

    it('should return null and log error if ApiClient.get fails', async () => {
      const mockError = new Error('Failed to fetch current user');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);
      console.error = jest.fn();

      const result = await getMe();

      expect(ApiClient.get).toHaveBeenCalledWith('/auth/me', {
        headers: {
          Authorization: 'Bearer mocked-jwt-token',
        },
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching current user:', mockError);
      expect(result).toBeNull();
    });
  });
});
