import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { UserModule } from './user/user.module';
import { MicropostModule } from './micropost/micropost.module';
import { DevelopModule } from './develop/develop.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { TestController } from './test/test.controller';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    WinstonModule.forRoot(winstonConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    UserModule,
    MicropostModule,
    DevelopModule,
    AuthModule,
    FollowModule,
  ],
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
