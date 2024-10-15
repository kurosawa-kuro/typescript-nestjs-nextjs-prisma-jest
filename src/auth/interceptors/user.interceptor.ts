import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthService } from '../jwt-auth.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private jwtAuthService: JwtAuthService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = await this.jwtAuthService.getUserFromToken(request);
    if (user) {
      request['user'] = user;
    }
    return next.handle();
  }
}
