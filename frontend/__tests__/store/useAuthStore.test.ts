import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuthStore } from '../../src/app/store/useAuthStore';
import { ApiService } from '../../src/app/services/apiService';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

// Mock ApiService and cookies-next
jest.mock('../../src/app/services/apiService');
jest.mock('cookies-next');

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    (setCookie as jest.Mock).mockImplementation(() => {});
    (getCookie as jest.Mock).mockImplementation(() => null);
    (deleteCookie as jest.Mock).mockImplementation(() => {});
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should log in successfully', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false, avatar_path: '' };
    const mockLoginResponse = { success: true, token: 'fake-token', user: mockUser };
    (ApiService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.loginStatus).toBe('Login successful');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(setCookie).toHaveBeenCalledWith('jwt', 'fake-token', { maxAge: 30 * 24 * 60 * 60 });
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should handle login failure', async () => {
    const mockLoginResponse = { success: false };
    (ApiService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'wrong-password');
      expect(success).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBe('Login failed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should handle API error during login', async () => {
    const apiError = new Error('Network error');
    (ApiService.login as jest.Mock).mockRejectedValue(apiError);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBe('Error occurred during login');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });

  it('should log out successfully', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loginStatus).toBe('Logged out successfully');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(deleteCookie).toHaveBeenCalledWith('jwt');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should initialize auth from localStorage and cookie', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false, avatar_path: '' };
    (getCookie as jest.Mock).mockReturnValue('fake-token');
    (ApiService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.initializeAuth();
    });

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when initializing auth with invalid data', async () => {
    (getCookie as jest.Mock).mockReturnValue('fake-token');
    (ApiService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Failed to fetch user profile'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.initializeAuth();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});