import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { JwtAuthModule } from './jwt-auth.module';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [JwtAuthModule, PrismaModule],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthModule],
})
export class AuthModule {}
