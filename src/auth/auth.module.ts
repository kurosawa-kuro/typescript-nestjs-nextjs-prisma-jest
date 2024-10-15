import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
