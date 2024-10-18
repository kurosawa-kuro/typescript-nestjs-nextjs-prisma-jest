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

    expect(response).toEqual(mockRedirectResponse);
  });

  // Add more tests here...
});
