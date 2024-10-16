import { getUserProfile } from '../../src/app/actions/users';
import { ApiClient } from '../../src/app/services/apiClient';
import { User } from '../../src/app/types/models';

// モックのインポート
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('../../src/app/services/apiClient');

describe('getUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile when token is present', async () => {
    // モックの設定
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false,
      avatar_path: 'path/to/avatar',
    };

    const mockCookies = {
      get: jest.fn().mockReturnValue({ value: 'mock-token' }),
    };
    (require('next/headers').cookies as jest.Mock).mockReturnValue(mockCookies);

    (ApiClient.get as jest.Mock).mockResolvedValue(mockUser);

    // 関数の実行
    const result = await getUserProfile();

    // アサーション
    expect(result).toEqual(mockUser);
    expect(ApiClient.get).toHaveBeenCalledWith('/auth/profile', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    });
  });

  it('should return null when token is not present', async () => {
    // モックの設定
    const mockCookies = {
      get: jest.fn().mockReturnValue(undefined),
    };
    (require('next/headers').cookies as jest.Mock).mockReturnValue(mockCookies);

    // 関数の実行
    const result = await getUserProfile();

    // アサーション
    expect(result).toBeNull();
    expect(ApiClient.get).not.toHaveBeenCalled();
  });

  it('should return null when API call fails', async () => {
    // モックの設定
    const mockCookies = {
      get: jest.fn().mockReturnValue({ value: 'mock-token' }),
    };
    (require('next/headers').cookies as jest.Mock).mockReturnValue(mockCookies);

    (ApiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    // コンソールエラーのモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // 関数の実行
    const result = await getUserProfile();

    // アサーション
    expect(result).toBeNull();
    expect(ApiClient.get).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user profile:', expect.any(Error));

    // クリーンアップ
    consoleSpy.mockRestore();
  });
});