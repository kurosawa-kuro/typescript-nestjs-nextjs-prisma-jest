import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DevelopService } from './develop.service';

@Controller('develop')
export class DevelopController {
  constructor(private developService: DevelopService) {}

  @Post('reset_db')
  @HttpCode(HttpStatus.OK)
  async resetDb() {
    // 注意: この操作は開発環境でのみ行うべきです
    return this.developService.resetDb();
  }

  @Post('demo_user_login')
  @HttpCode(HttpStatus.OK)
  async demoUserLogin() {
    return { message: 'demo_user_login.' };
  }
}
