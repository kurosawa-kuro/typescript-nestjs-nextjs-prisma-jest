import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('test')
export class TestController {
  @Get('public')
  @Public()
  public() {
    return 'This is a public route';
  }

  @Get('protected')
  protected() {
    return 'This is a protected route';
  }
}
