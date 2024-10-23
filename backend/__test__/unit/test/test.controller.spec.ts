import { Test, TestingModule } from '@nestjs/testing';
import { TestController } from '@/features/test/test.controller';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { UserInfo } from '@/features/auth/decorators/user.decorator';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@/features/auth/auth.service';

describe('TestController', () => {
  let controller: TestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            // Add any methods from AuthService that AuthGuard might use
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('public', () => {
    it('should return public route message', () => {
      expect(controller.public()).toBe('This is a public route');
    });
  });

  describe('protected', () => {
    it('should return protected route message', () => {
      expect(controller.protected()).toBe('This is a protected route');
    });
  });

  describe('getProfile', () => {
    it('should return welcome message with user name', () => {
      const mockUser: UserInfo = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john.doe@example.com', 
        userRoles: ['general'], 
        avatarPath: '/path/to/avatar.jpg'
      };
      expect(controller.getProfile(mockUser)).toEqual({
        message: 'Welcome John Doe!',
      });
    });
  });

  describe('adminOnly', () => {
    it('should return admin message and secret data', () => {
      const mockAdminUser: UserInfo = { 
        id: 1, 
        name: 'Admin User', 
        email: 'admin@example.com',
        userRoles: ['admin'],
        avatarPath: '/path/to/admin-avatar.jpg'
      };
      expect(controller.adminOnly(mockAdminUser)).toEqual({
        message: 'Welcome Admin Admin User!',
        secretData: 'This is confidential information.',
      });
    });
  });
});
