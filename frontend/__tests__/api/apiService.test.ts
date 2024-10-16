import { ApiService } from '../../src/app/services/apiService';
import { ApiClient } from '../../src/app/services/apiClient';
import { LoginResponse, User } from '../../src/app/types/models';

// Mock the ApiClient
jest.mock('../../src/app/services/apiClient');

describe('ApiService', () => {
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockUser: User = { 
    id: 1, 
    name: 'Test User', 
    email: mockEmail, 
    isAdmin: false, 
    avatar_path: 'path/to/avatar' 
  };
  const mockLoginResponse: LoginResponse = {
    success: true,
    message: 'Login successful',
    token: 'mock-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return user data', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await ApiService.login(mockEmail, mockPassword);

      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email: mockEmail, password: mockPassword });
      expect(result).toEqual(mockLoginResponse);
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock-token');
    });

    it('should throw an error when login fails due to invalid credentials', async () => {
      const failedLoginResponse = {
        success: false,
        message: 'Invalid email or password',
      };
      (ApiClient.post as jest.Mock).mockResolvedValue(failedLoginResponse);

      await expect(ApiService.login(mockEmail, mockPassword)).rejects.toThrow('Invalid email or password');
      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email: mockEmail, password: mockPassword });
    });

    it('should throw an error when login response is undefined', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue(undefined);

      await expect(ApiService.login(mockEmail, mockPassword)).rejects.toThrow('Login failed');
      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email: mockEmail, password: mockPassword });
    });

    it('should throw an error with default message when login fails without specific message', async () => {
      const failedLoginResponse = {
        success: false,
      };
      (ApiClient.post as jest.Mock).mockResolvedValue(failedLoginResponse);

      await expect(ApiService.login(mockEmail, mockPassword)).rejects.toThrow('Login failed');
      expect(ApiClient.post).toHaveBeenCalledWith('/auth/login', { email: mockEmail, password: mockPassword });
    });
  });

  describe('getUserProfile', () => {
    it('should successfully fetch and return user profile', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await ApiService.getUserProfile();

      expect(ApiClient.get).toHaveBeenCalledWith('/auth/profile');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when fetching user profile fails', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue(null);

      await expect(ApiService.getUserProfile()).rejects.toThrow('Failed to get user profile');
      expect(ApiClient.get).toHaveBeenCalledWith('/auth/profile');
    });

    it('should throw an error when API returns undefined', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue(undefined);

      await expect(ApiService.getUserProfile()).rejects.toThrow('Failed to get user profile');
      expect(ApiClient.get).toHaveBeenCalledWith('/auth/profile');
    });

    it('should throw an error when API throws an exception', async () => {
      (ApiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(ApiService.getUserProfile()).rejects.toThrow('Network error');
      expect(ApiClient.get).toHaveBeenCalledWith('/auth/profile');
    });
  });
});