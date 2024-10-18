import { ClientSideApiService } from '../../src/services/ClientSideApiService';
import { ApiClient } from '../../src/services/apiClient';

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
});
