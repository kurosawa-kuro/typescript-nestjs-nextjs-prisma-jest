import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';

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
            register: jest.fn().mockResolvedValue({ message: 'User registered successfully' }),
            login: jest.fn().mockResolvedValue({ message: 'User logged in successfully' }),
            logout: jest.fn().mockResolvedValue({ message: 'User logged out successfully' }),
            me: jest.fn().mockResolvedValue({ message: 'User information retrieved successfully' }),
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
      const result = await authController.register();
      expect(authService.register).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const result = await authController.login();
      expect(authService.login).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User logged in successfully' });
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const result = await authController.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });

  describe('me', () => {
    it('should call authService.me', async () => {
      const result = await authController.me();
      expect(authService.me).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User information retrieved successfully' });
    });
  });
});
