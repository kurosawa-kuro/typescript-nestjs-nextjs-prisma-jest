import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

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
  });

  describe('logout', () => {
    it('should clear the jwt cookie and return a success message', async () => {
      const mockResponse = { clearCookie: jest.fn() } as unknown as Response;

      const result = await service.logout(mockResponse);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
    });
  });
});
