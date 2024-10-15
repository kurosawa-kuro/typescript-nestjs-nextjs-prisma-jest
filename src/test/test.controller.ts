import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '@/auth/decorators/user.decorator';

// Define a custom UserInfo interface
interface UserInfo {
  email: string;
  name: string;
  // Add other user properties as needed
}

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

  @Get('profile')
  getProfile(@User() user: UserInfo) {
    console.log(user);
    return { message: `Welcome ${user.name}!` };
  }
}
