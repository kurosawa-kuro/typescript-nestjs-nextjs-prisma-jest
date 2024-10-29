import { getMicroposts, getMicropostDetails, getMicropostComments } from '../../src/app/actions/micropost';
import { ApiClient } from '../../src/services/apiClient';
import { Micropost, Comment } from '../../src/types/micropost';

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

describe('Micropost Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // コンソールエラーをモック化
  });

  describe('getMicroposts', () => {
    it('should return microposts when API call is successful', async () => {
      const mockMicroposts: Micropost[] = [
        {
          id: 1,
          title: 'Test Post 1',
          imagePath: 'path/to/image1.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: 1,
            name: 'Test User',
            profile: { avatarPath: 'path/to/avatar.jpg' }
          },
          comments: [],
          likesCount: 0,
          isLiked: false
        }
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

      const result = await getMicroposts();

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockMicroposts);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Failed to fetch microposts');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(getMicroposts()).rejects.toThrow('Failed to fetch microposts');
      expect(console.error).toHaveBeenCalledWith('Error fetching microposts:', mockError);
    });
  });

  describe('getMicropostDetails', () => {
    it('should return micropost details when API call is successful', async () => {
      const mockMicropost: Micropost = {
        id: 1,
              title: 'Test Post',
        imagePath: 'path/to/image.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 1,
          name: 'Test User',
          profile: { avatarPath: 'path/to/avatar.jpg' }
        },
        comments: [],
        likesCount: 0,
        isLiked: false
      };

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicropost);

      const result = await getMicropostDetails(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts/1', {
        headers: { Authorization: 'Bearer mocked-jwt-token' },
      });
      expect(result).toEqual(mockMicropost);
    });
  });
});