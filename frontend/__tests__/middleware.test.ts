import '@testing-library/jest-dom';

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../src/middleware';
import { ClientSideApiService } from '../src/services/ClientSideApiService';

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn().mockImplementation((url) => ({ 
      type: 'redirect', 
      url,
      cookies: {
        delete: jest.fn(),
      },
    })),
    next: jest.fn().mockImplementation(() => ({ type: 'next' })),
  },
}));

jest.mock('../src/services/ClientSideApiService', () => ({
  ClientSideApiService: {
    me: jest.fn(),
  },
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      cookies: {
        get: jest.fn(),
      },
      nextUrl: {
        pathname: '',
      },
      url: 'http://localhost/',
    } as unknown as NextRequest;
  });

  test('skips processing for login page', async () => {
    mockRequest.nextUrl.pathname = '/login';
    const result = await middleware(mockRequest);
    expect(result.type).toBe('next');
  });

  test('redirects to login page when no token is present', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue(undefined);
    mockRequest.nextUrl.pathname = '/some-protected-route';
    await middleware(mockRequest);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', mockRequest.url));
  });

  test('does not redirect when token is present and user data is valid', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
    mockRequest.nextUrl.pathname = '/some-protected-route';
    (ClientSideApiService.me as jest.Mock).mockResolvedValue({ userRoles: ['user'] });
    const result = await middleware(mockRequest);
    expect(NextResponse.next).toHaveBeenCalled();
    expect(result.type).toBe('next');
  });

  test('redirects to home when non-admin user tries to access admin route', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
    mockRequest.nextUrl.pathname = '/admin/some-route';
    (ClientSideApiService.me as jest.Mock).mockResolvedValue({ userRoles: ['user'] });
    const result = await middleware(mockRequest);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/', mockRequest.url));
    expect(result.type).toBe('redirect');
  });

  test('allows admin user to access admin route', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
    mockRequest.nextUrl.pathname = '/admin/some-route';
    (ClientSideApiService.me as jest.Mock).mockResolvedValue({ userRoles: ['admin'] });
    const result = await middleware(mockRequest);
    expect(NextResponse.next).toHaveBeenCalled();
    expect(result.type).toBe('next');
  });

  test('redirects to login and deletes jwt cookie when an error occurs', async () => {
    mockRequest.cookies.get = jest.fn().mockReturnValue({ value: 'valid-token' });
    mockRequest.nextUrl.pathname = '/some-protected-route';
    (ClientSideApiService.me as jest.Mock).mockRejectedValue(new Error('API Error'));
    const result = await middleware(mockRequest);
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('/login', mockRequest.url));
    expect(result.type).toBe('redirect');
    expect(result.cookies.delete).toHaveBeenCalledWith('jwt');
  });
});
