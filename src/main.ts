import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { config } from 'dotenv';

async function bootstrap() {
  // 開発環境用の.envファイルを読み込む
  config({ path: '.env.development' });

  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));

  await app.listen(3001);
}
bootstrap();
