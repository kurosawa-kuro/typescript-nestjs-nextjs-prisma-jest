import { getMicroposts, getMicropostDetails, getMicropostComments } from '../../src/app/actions/micropost';
import { ApiClient } from '../../src/services/apiClient';
import { Micropost, Comment } from '../../src/types/micropost';

jest.mock('../../src/services/apiClient', () => ({
  ApiClient: {
    get: jest.fn(),
  },
}));

describe('Micropost Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
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
          isLiked: false,
          viewsCount: 0,
          categories: []
        }
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

      const result = await getMicroposts();

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts', {
        params: { 
          search: undefined,
          sortBy: undefined 
        },
      });
      expect(result).toEqual(mockMicroposts);
    });

    it('should include search query and sort when provided', async () => {
      const searchQuery = 'test search';
      const sortBy = 'date';
      const mockMicroposts: Micropost[] = [];
      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicroposts);

      await getMicroposts(searchQuery, sortBy);

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts', {
        params: { 
          search: searchQuery,
          sortBy: sortBy 
        },
      });
    });

    it('should return empty array when API call fails', async () => {
      const mockError = new Error('Failed to fetch microposts');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      const result = await getMicroposts();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching microposts',
        mockError
      );
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
        isLiked: false,
        viewsCount: 0,
        categories: []
      };

      (ApiClient.get as jest.Mock).mockResolvedValue(mockMicropost);

      const result = await getMicropostDetails(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts/1');
      expect(result).toEqual(mockMicropost);
    });

    it('should return null when API call fails', async () => {
      const mockError = new Error('Failed to fetch micropost details');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      const result = await getMicropostDetails(1);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching micropost details for id 1',
        mockError
      );
    });
  });

  describe('getMicropostComments', () => {
    it('should return comments when API call is successful', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          userId: 1,
          micropostId: 1,
          content: 'Test Comment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: 1,
            name: 'Test User',
            profile: { avatarPath: 'path/to/avatar.jpg' }
          }
        }
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockComments);

      const result = await getMicropostComments(1);

      expect(ApiClient.get).toHaveBeenCalledWith('/microposts/1/comments');
      expect(result).toEqual(mockComments);
    });

    it('should return empty array when API call fails', async () => {
      const mockError = new Error('Failed to fetch comments');
      (ApiClient.get as jest.Mock).mockRejectedValue(mockError);

      const result = await getMicropostComments(1);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching comments for micropost 1',
        mockError
      );
    });
  });
});