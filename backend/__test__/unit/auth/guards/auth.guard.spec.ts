import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../../../../src/auth/guards/auth.guard';
import { AuthService } from '../../../../src/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUserFromToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get(Reflector);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: jest.Mocked<ExecutionContext>;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should allow access for public routes', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      authService.getUserFromToken.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access for authenticated non-admin user on non-admin route', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);
      authService.getUserFromToken.mockResolvedValue({ id: 1, isAdmin: false, name: 'Test User', email: 'test@example.com' });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for non-admin user on admin route', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(true);
      authService.getUserFromToken.mockResolvedValue({ id: 1, isAdmin: false, name: 'Test User', email: 'test@example.com' });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access for admin user on admin route', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(true);
      authService.getUserFromToken.mockResolvedValue({ id: 1, isAdmin: true, name: 'Admin User', email: 'admin@example.com' });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});
