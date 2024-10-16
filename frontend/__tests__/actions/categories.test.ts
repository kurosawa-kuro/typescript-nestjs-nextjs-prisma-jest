import { getCategories, getCategoryId, getCategoryMicroposts } from '../../src/app/actions/categories';
import { ApiClient } from '../../src/app/services/apiClient';
import { Category, MicroPost } from '../../src/app/types/models';

jest.mock('../../src/app/services/apiClient');

describe('Category Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch and return categories successfully', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle fetch error and return empty array', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([]);
    });

    it('should filter out undefined categories', async () => {
      const mockCategories = [
        { id: 1, title: 'Category 1' },
        undefined,
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ]);
    });
  });

  describe('getCategoryId', () => {
    it('should return the correct category id', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBe(1);
    });

    it('should return null if category is not found', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('Non-existent Category');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle fetch error and return null', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle case when getCategories returns an empty array', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue([]);

      const result = await getCategoryId('Category 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive category name matching', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategoryId('cAtEgOrY 1');

      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toBe(1);
    });
  });

  describe('getCategoryMicroposts', () => {
    it('should fetch and return microposts for a category successfully', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      const mockMicroposts: MicroPost[] = [
        { id: 1, user: { id: 1, name: 'User1', avatarPath: '' }, title: 'Post 1',  imagePath: '',   categories: [] },
        { id: 2, user: { id: 2, name: 'User2', avatarPath: '' }, title: 'Post 2',   imagePath: '',  categories: [] },
      ];

      (ApiClient.get as jest.Mock)
        .mockResolvedValueOnce(mockCategories)
        .mockResolvedValueOnce(mockMicroposts);

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledTimes(2);
      expect(ApiClient.get).toHaveBeenNthCalledWith(1, '/categories');
      expect(ApiClient.get).toHaveBeenNthCalledWith(2, '/categories/1/microposts');
      expect(result).toEqual(mockMicroposts);
    });

    it('should handle fetch error and return empty array', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock)
        .mockResolvedValueOnce(mockCategories)
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledTimes(2);
      expect(ApiClient.get).toHaveBeenNthCalledWith(1, '/categories');
      expect(ApiClient.get).toHaveBeenNthCalledWith(2, '/categories/1/microposts');
      expect(result).toEqual([]);
    });

    it('should return empty array when category is not found', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];

      (ApiClient.get as jest.Mock).mockResolvedValueOnce(mockCategories);

      const result = await getCategoryMicroposts('Non-existent Category');

      expect(ApiClient.get).toHaveBeenCalledTimes(1);
      expect(ApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual([]);
    });

    it('should filter out undefined microposts', async () => {
      const mockCategories: Category[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
      ];
      const mockMicroposts = [
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1', imagePath: '', userAvatarPath: '', categories: [] },
        undefined,
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2', imagePath: '', userAvatarPath: '', categories: [] },
      ];

      (ApiClient.get as jest.Mock)
        .mockResolvedValueOnce(mockCategories)
        .mockResolvedValueOnce(mockMicroposts);

      const result = await getCategoryMicroposts('Category 1');

      expect(ApiClient.get).toHaveBeenCalledTimes(2);
      expect(ApiClient.get).toHaveBeenNthCalledWith(1, '/categories');
      expect(ApiClient.get).toHaveBeenNthCalledWith(2, '/categories/1/microposts');
      expect(result).toEqual([
        { id: 1, userId: 1, title: 'Post 1', userName: 'User1', imagePath: '', userAvatarPath: '', categories: [] },
        { id: 2, userId: 2, title: 'Post 2', userName: 'User2', imagePath: '', userAvatarPath: '', categories: [] },
      ]);
    });
  });
});