import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserModule } from './user/user.module';
import { MicropostModule } from './micropost/micropost.module';
import { DevelopModule } from './develop/develop.module';

@Module({
  imports: [UserModule, MicropostModule, DevelopModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
