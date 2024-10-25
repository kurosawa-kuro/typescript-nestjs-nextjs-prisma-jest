import { ClientSideApiService } from '../../src/services/ClientSideApiService';
import { ApiClient } from '../../src/services/apiClient';
import { UserDetails } from '../../src/types/models';

// ApiClient をモック化
jest.mock('../../src/services/apiClient');

describe('ClientSideApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      const mockLoginResponse = { token: 'test-token', user: { id: 1, email: 'test@example.com' } };
      (ApiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const email = 'test@example.com';
      const password = 'password123';

      const result = await ClientSideApiService.login(email, password);

      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('should call ApiClient.post with correct parameters', async () => {
      await ClientSideApiService.logout();

      expect(ApiClient.post).toHaveBeenCalledWith('/auth/logout', {});
    });
  });

  describe('me', () => {
    it('should call ApiClient.get with correct parameters', async () => {
      const mockUserResponse = { id: 1, email: 'test@example.com' };
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUserResponse);

      const token = 'test-token';

      const result = await ClientSideApiService.me(token);

      expect(ApiClient.get).toHaveBeenCalledWith('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('updateAvatar', () => {
    it('should call ApiClient.put with correct parameters', async () => {
      const mockUserDetails: UserDetails = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'new/avatar/path' },
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const formData = new FormData();
      formData.append('avatar', new Blob(['test']), 'test.jpg');

      const result = await ClientSideApiService.updateAvatar(userId, formData);

      expect(ApiClient.put).toHaveBeenCalledWith(
        `/users/${userId}/avatar`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          rawBody: true,
        }
      );
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('updateUserProfile', () => {
    it('should call ApiClient.put with correct parameters', async () => {
      const mockUserDetails: UserDetails = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        userRoles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      (ApiClient.put as jest.Mock).mockResolvedValue(mockUserDetails);

      const userId = 1;
      const updatedFields: Partial<UserDetails> = { name: 'Updated User' };

      const result = await ClientSideApiService.updateUserProfile(userId, updatedFields);

      expect(ApiClient.put).toHaveBeenCalledWith(`/users/${userId}`, updatedFields);
      expect(result).toEqual(mockUserDetails);
    });
  });
});
