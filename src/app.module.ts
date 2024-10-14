import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { UserModule } from './user/user.module';
import { MicropostModule } from './micropost/micropost.module';
import { DevelopModule } from './develop/develop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    UserModule,
    MicropostModule,
    DevelopModule
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}