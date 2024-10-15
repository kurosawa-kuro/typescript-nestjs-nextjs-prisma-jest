import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

interface UserPayload {
  id: number;
  name: string;
  isAdmin: boolean;
  // 他の必要なユーザー情報フィールド
}

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('UserInterceptor');
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, { secret: 'secretKey' });
        console.log('payload', payload);
        request.user = payload;
      } catch (error) {
        // トークンが無効な場合はユーザー情報を設定しない
        console.error('Invalid token:', error.message);
      }
    }

    return next.handle();
  }

  private extractTokenFromRequest(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return request.cookies?.jwt;
  }
}
