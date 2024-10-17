import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({ token: 'mockToken', user: { id: 1, name: 'Test User' } }),
            login: jest.fn().mockResolvedValue({ token: 'mockToken', user: { id: 1, name: 'Test User' } }),
            logout: jest.fn().mockResolvedValue({ message: 'User logged out successfully' }),
            me: jest.fn().mockResolvedValue({ message: 'User information retrieved successfully' }),
            setTokenCookie: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const mockUser = { name: 'testuser', email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const result = await authController.register(mockUser, mockResponse);
      expect(authService.register).toHaveBeenCalledWith(mockUser);
      expect(authService.setTokenCookie).toHaveBeenCalledWith(mockResponse, 'mockToken');
      expect(result).toEqual({ message: 'Registration successful', token: 'mockToken', user: { id: 1, name: 'Test User' } });
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const mockUser = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const result = await authController.login(mockUser, mockResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(authService.setTokenCookie).toHaveBeenCalledWith(mockResponse, 'mockToken');
      expect(result).toEqual({ message: 'Login successful', token: 'mockToken', user: { id: 1, name: 'Test User' } });
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;
      const result = await authController.logout(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });

  describe('me', () => {
    it('should call authService.me', async () => {
      const mockUserInfo = { id: 1, name: 'Test User', email: 'test@example.com', isAdmin: false };
      const result = await authController.me(mockUserInfo);
      expect(result).toEqual(mockUserInfo);
    });
  });
});
