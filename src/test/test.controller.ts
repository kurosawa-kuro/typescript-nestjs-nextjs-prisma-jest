import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Admin } from '../auth/decorators/admin.decorator';
import { User } from '@/auth/decorators/user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

// Define a custom UserInfo interface
interface UserInfo {
  id: number;
  name: string;
  isAdmin: boolean;
}

@Controller('test')
@UseGuards(AuthGuard)
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

  @Get('admin')
  @Admin()
  adminOnly(@User() user: UserInfo) {
    return {
      message: `Welcome Admin ${user.name}!`,
      secretData: 'This is confidential information.',
    };
  }
}
