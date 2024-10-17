import { ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../../../src/auth/decorators/user.decorator';

jest.mock('../../../src/auth/decorators/user.decorator', () => ({
  User: jest.fn((property: string) => (ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return property ? request.user[property] : request.user;
  }),
}));

describe('User Decorator', () => {
  let mockUser: UserInfo;
  let mockExecutionContext: ExecutionContext;
  let User: jest.Mock;

  beforeEach(() => {
    mockUser = { id: 1, name: 'Test User', isAdmin: false };
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      }),
    } as any;
    User = jest.requireMock('../../../src/auth/decorators/user.decorator').User;
  });

  it('should extract entire user info from request', () => {
    const decorator = User();
    const result = decorator(mockExecutionContext);

    expect(User).toHaveBeenCalledWith();
    expect(result).toEqual(mockUser);
  });

  it('should extract specific user property from request', () => {
    const decorator = User('name');
    const result = decorator(mockExecutionContext);

    expect(User).toHaveBeenCalledWith('name');
    expect(result).toBe('Test User');
  });
});
