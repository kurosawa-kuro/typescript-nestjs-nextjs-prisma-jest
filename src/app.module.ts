import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserModule } from './user/user.module';
import { MicropostModule } from './micropost/micropost.module';

@Module({
  imports: [UserModule, MicropostModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}