import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../../src/store/authStore';
import { ClientSideApiService } from '../../src/services/ClientSideApiService';
import { useFlashMessageStore } from '../../src/store/flashMessageStore';
import { TokenUser } from '@/types/models';

// モックの設定
jest.mock('../../src/services/ClientSideApiService');
jest.mock('../../src/store/flashMessageStore', () => ({
  useFlashMessageStore: {
    getState: jest.fn(() => ({
      setFlashMessage: jest.fn(),
    })),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.getState().resetStore();
    });
    // Reset the flashMessageStore mock
    (useFlashMessageStore.getState as jest.Mock).mockReturnValue({
      setFlashMessage: jest.fn(),
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('login', () => {
    it('should update state on successful login', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockResponse = { user: mockUser, token: 'test-token' };
      (ClientSideApiService.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(useFlashMessageStore.getState().setFlashMessage).toHaveBeenCalledWith('Login successful!');
    });

    it('should update state on failed login', async () => {
      (ClientSideApiService.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Login failed');
    });
  });

  describe('logout', () => {
    it('should clear state and redirect on successful logout', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      act(() => {
        useAuthStore.setState({ user: mockUser as TokenUser });
      });

      const { result } = renderHook(() => useAuthStore());

      // window.location.href のモック
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(ClientSideApiService.logout).toHaveBeenCalled();
      expect(useFlashMessageStore.getState().setFlashMessage).toHaveBeenCalledWith('Logged out successfully');
      expect(window.location.href).toBe('/');

      // Restore original location
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe('setUser', () => {
    it('should update user state', () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', isAdmin: false, avatar_path: '' };
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ user: mockUser });
      });

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ isLoading: true });
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('setError', () => {
    it('should update error state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');
    });
  });
});
