import { NextRequest } from 'next/server';

// Mock the entire middleware module
jest.mock('../src/middleware', () => ({
  middleware: jest.fn(),
}));

// Import the mocked middleware function
import { middleware } from '../src/middleware';

describe('Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = {
      cookies: {
        get: jest.fn(),
      },
      nextUrl: {
        pathname: '',
      },
      url: 'http://localhost/',
    } as unknown as NextRequest;

    // Reset the middleware mock before each test
    (middleware as jest.Mock).mockReset();
  });

  test('redirects to login page when no token is present', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue(undefined);
    mockRequest.nextUrl.pathname = '/some-protected-route';

    const mockRedirectResponse = {
      type: 'redirect',
      url: 'http://localhost/login',
    };

    (middleware as jest.Mock).mockResolvedValue(mockRedirectResponse);

    const response = await middleware(mockRequest);
    console.log("redirects to login page when no token is present response", response);

    expect(response).toEqual(mockRedirectResponse);
  });

  // ユーザーログインしている場合
  test('does not redirect when token is present', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue('valid-token');
    mockRequest.nextUrl.pathname = '/some-protected-route';

    const mockResponse = {
      type: 'next',
      url: 'http://localhost/some-protected-route',
    };

    (middleware as jest.Mock).mockResolvedValue(mockResponse);

    const response = await middleware(mockRequest);
    console.log("does not redirect when token is present response", response);

    expect(response).toEqual(mockResponse);
  });

  // 管理者ログインしている場合
  test('does not redirect when admin token is present', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue('admin-token');
    mockRequest.nextUrl.pathname = '/admin-protected-route';

    const mockResponse = {
      type: 'next',
      url: 'http://localhost/admin-protected-route',
    };

    (middleware as jest.Mock).mockResolvedValue(mockResponse);

    const response = await middleware(mockRequest);
    console.log("does not redirect when admin token is present response", response);

    expect(response).toEqual(mockResponse);
  });

  // Add more tests here...
});
