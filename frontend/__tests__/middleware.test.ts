import { NextRequest, NextResponse } from 'next/server';
import { ClientSideApiService } from '../src/services/ClientSideApiService';

// Mock the next/server module
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn().mockImplementation((url) => ({
      headers: new Map([['Location', url]]),
      cookies: {
        delete: jest.fn(),
      },
    })),
  },
}));

// Mock the entire middleware module
jest.mock('../src/middleware', () => {
  const originalModule = jest.requireActual('../src/middleware');
  return {
    __esModule: true,
    ...originalModule,
  };
});

// Mock the ClientSideApiService
jest.mock('../src/services/ClientSideApiService');

// Import the mocked middleware function
import { middleware } from '../src/middleware';

// Add this function before the describe block
function createMockRequest(pathname: string, token: string | undefined): NextRequest {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
    nextUrl: {
      pathname,
    },
    url: `http://localhost${pathname}`,
    headers: new Headers(),
  } as unknown as NextRequest;
}

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
      headers: new Headers(),
    } as unknown as NextRequest;
  });

  test('skips processing for login page', async () => {
    mockRequest.nextUrl.pathname = '/login';
    const response = await middleware(mockRequest);
    expect(NextResponse.next).toHaveBeenCalled();
  });

  // test('redirects to login page when no token is present', async () => {
  //   mockRequest.cookies.get = jest.fn().mockReturnValue(undefined);
  //   mockRequest.nextUrl.pathname = '/some-protected-route';

  //   const response = await middleware(mockRequest);
  //   expect(response).toBeInstanceOf(NextResponse);
  //   expect(response.headers.get('Location')).toBe('http://localhost/login');
  // });

  // test('allows access to protected route with valid token', async () => {
  //   mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
  //   mockRequest.nextUrl.pathname = '/profile';
  //   (ClientSideApiService.me as jest.Mock).mockResolvedValue({ id: 1, name: 'Test User' });

  //   const response = await middleware(mockRequest);
  //   expect(NextResponse.next).toHaveBeenCalled();
  //   expect(response.headers.get('x-user-data')).toBe(JSON.stringify({ id: 1, name: 'Test User' }));
  // });

  // test('redirects non-admin user from admin route', async () => {
  //   mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
  //   mockRequest.nextUrl.pathname = '/admin/dashboard';
  //   (ClientSideApiService.me as jest.Mock).mockResolvedValue({ id: 1, name: 'Test User', isAdmin: false });

  //   const response = await middleware(mockRequest);
  //   expect(response).toBeInstanceOf(NextResponse);
  //   expect(response.headers.get('Location')).toBe('http://localhost/');
  // });

  // test('allows admin user to access admin route', async () => {
  //   mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
  //   mockRequest.nextUrl.pathname = '/admin/dashboard';
  //   (ClientSideApiService.me as jest.Mock).mockResolvedValue({ id: 1, name: 'Admin User', isAdmin: true });

  //   const response = await middleware(mockRequest);
  //   expect(NextResponse.next).toHaveBeenCalled();
  // });

  test('redirects to login and deletes cookie on API error', async () => {
    console.log('Starting test: redirects to login and deletes cookie on API error');
    
    const mockRequest = createMockRequest('/profile', 'invalid-token');
    
    // Mock the ClientSideApiService.me method to throw an error
    jest.spyOn(ClientSideApiService, 'me').mockRejectedValue(new Error('API Error'));
    
    // Mock NextResponse.redirect
    const mockRedirect = jest.fn().mockReturnValue({
      cookies: {
        delete: jest.fn(),
      },
    });
    NextResponse.redirect = mockRedirect;
  
    console.log('Calling middleware');
    const response = await middleware(mockRequest);
  
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/login', 'http://localhost'));
    expect(response.cookies.delete).toHaveBeenCalledWith('jwt');
  });

  // Add more tests here...
});
