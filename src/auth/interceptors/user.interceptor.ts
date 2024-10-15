import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthService } from '../jwt-auth.service';

interface UserPayload {
  id: number;
  name: string;
  isAdmin: boolean;
  // 他の必要なユーザー情報フィールド
}

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private jwtAuthService: JwtAuthService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = this.jwtAuthService.extractTokenFromRequest(request);

    if (token) {
      try {
        const payload = await this.jwtAuthService.verifyToken(token);
        request.user = payload;
      } catch (error) {
        // トークンが無効な場合はユーザー情報を設定しない
        console.error('Invalid token:', error.message);
      }
    }

    return next.handle();
  }
}
