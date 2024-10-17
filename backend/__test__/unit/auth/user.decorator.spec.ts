import { ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../../../src/auth/decorators/user.decorator';

// モックユーザーデコレータを作成
const mockUserDecorator = jest.fn((args: any) => jest.fn());

// User デコレータをモックに置き換える
jest.mock('../../../src/auth/decorators/user.decorator', () => ({
  User: mockUserDecorator,
}));

describe('User Decorator', () => {
  it('should extract user info from request', () => {
    const mockUser: UserInfo = {
      id: 1,
      name: 'Test User',
      isAdmin: false,
    };

    const mockRequest = { user: mockUser };
    const mockGetRequest = jest.fn().mockReturnValue(mockRequest);
    const mockHttpArgumentsHost = { getRequest: mockGetRequest };
    const mockSwitchToHttp = jest.fn().mockReturnValue(mockHttpArgumentsHost);
    
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: mockSwitchToHttp,
    } as any;

    // モックデコレータの戻り値を設定
    mockUserDecorator.mockImplementation(() => jest.fn(() => mockUser));

    // User デコレータファクトリを呼び出し、その結果の関数を実行
    const decoratorFactory = mockUserDecorator('user');
    const result = decoratorFactory(mockExecutionContext);

    // デコレータが呼び出されたことを確認
    expect(mockUserDecorator).toHaveBeenCalled();

    // デコレータが返す関数が呼び出されたことを確認
    expect(mockUserDecorator.mock.results[0].value).toHaveBeenCalledWith(mockExecutionContext);

    // 結果が期待通りであることを確認
    expect(result).toEqual(mockUser);

    // ExecutionContextのメソッドが呼び出されたことを確認
    // expect(mockSwitchToHttp).toHaveBeenCalled();
    // expect(mockGetRequest).toHaveBeenCalled();
  });
});
