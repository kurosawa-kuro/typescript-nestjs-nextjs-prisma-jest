import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Request } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedpassword123',
    isAdmin: false,
    avatarPath: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockUserInfo = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  };

  const mockToken = 'mock_token';
  const mockSecret = 'mock_secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            validateUser: jest.fn(),
            mapUserToUserInfo: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Common mock setups
    userService.mapUserToUserInfo.mockReturnValue(mockUserInfo);
    jwtService.signAsync.mockResolvedValue(mockToken);
    configService.get.mockReturnValue(mockSecret);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return a token and user info', async () => {
      const mockRegisterDto = { 
        username: 'testuser', 
        password: 'password123', 
        name: 'Test User', 
        email: 'test@example.com' 
      };

      userService.createUser.mockResolvedValue(mockUser);

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual({ token: mockToken, user: mockUserInfo });
      expect(userService.createUser).toHaveBeenCalledWith(mockRegisterDto);
      expect(userService.mapUserToUserInfo).toHaveBeenCalledWith(mockUser);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        mockUserInfo,
        {
          secret: mockSecret,
          expiresIn: '1d'
        }
      );
    });
  });

  describe('login', () => {
    it('should return a token and user info', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'password123' };

      userService.validateUser.mockResolvedValue(mockUser);

      const result = await service.login(mockCredentials);

      expect(result).toEqual({ token: mockToken, user: mockUserInfo });
      expect(userService.validateUser).toHaveBeenCalledWith(mockCredentials.email, mockCredentials.password);
      expect(userService.mapUserToUserInfo).toHaveBeenCalledWith(mockUser);
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockUserInfo, expect.any(Object));
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const mockCredentials = { email: 'invalid@example.com', password: 'wrongpassword' };
      userService.validateUser.mockResolvedValue(null);

      await expect(service.login(mockCredentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear the jwt cookie and return a success message', async () => {
      const mockResponse = { clearCookie: jest.fn() } as unknown as Response;

      const result = await service.logout(mockResponse);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user info from a valid token', async () => {
      const mockRequest = {
        cookies: { jwt: 'valid_token' },
        headers: {},
      } as Request;

      jwtService.verifyAsync.mockResolvedValue(mockUserInfo);

      const result = await service.getUserFromToken(mockRequest);

      expect(result).toEqual(mockUserInfo);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid_token', { secret: 'JWT_SECRET' });
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockRequest = {
        cookies: {},
        headers: {},
      } as unknown as Request;

      await expect(service.getUserFromToken(mockRequest)).rejects.toThrow('No token provided');
    });
  });

  describe('setTokenCookie', () => {
    it('should set a JWT cookie', () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      service.setTokenCookie(mockResponse, mockToken);

      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', mockToken, {
        httpOnly: true,
        secure: false, // Because NODE_ENV is not 'production' in test environment
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockUserInfo);

      const result = await service['verifyToken'](mockToken);

      expect(result).toEqual(mockUserInfo);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, { secret: 'JWT_SECRET' });
    });

    it('should throw an error for an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service['verifyToken']('invalid_token')).rejects.toThrow('Invalid token');
    });
  });

  describe('extractTokenFromRequest', () => {
    it('should extract token from cookies', () => {
      const mockRequest = {
        cookies: { jwt: 'cookie_token' },
        headers: {},
      } as unknown as Request;

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBe('cookie_token');
    });

    it('should extract token from Authorization header', () => {
      const mockRequest = {
        cookies: {},
        headers: { authorization: 'Bearer header_token' },
      } as unknown as Request;

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBe('header_token');
    });

    it('should return undefined if no token is found', () => {
      const mockRequest = {
        cookies: {},
        headers: {},
      } as unknown as Request;

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBeUndefined();
    });
  });
});
