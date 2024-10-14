import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return a success message', async () => {
      const result = await service.register();
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should return a success message', async () => {
      const result = await service.login();
      expect(result).toEqual({ message: 'User logged in successfully' });
    });
  });

  describe('logout', () => {
    it('should return a success message', async () => {
      const result = await service.logout();
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });

  describe('me', () => {
    it('should return a success message', async () => {
      const result = await service.me();
      expect(result).toEqual({ message: 'User information retrieved successfully' });
    });
  });
});
