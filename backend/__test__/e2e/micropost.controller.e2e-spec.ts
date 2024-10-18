// micropost.controller.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import {
  setupTestApp,
  cleanupDatabase,
  createTestUser,
  createTestMicropost,
  loginTestUser,
} from './test-utils';

describe('MicropostController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService } = await setupTestApp());
  });

  afterAll(async () => {
    await cleanupDatabase(prismaService);
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase(prismaService);
  });

  it('/GET microposts', async () => {
    // テストユーザーを作成
    const testUser = await createTestUser(prismaService, {
      email: 'test@example.com',
      password: 'password123',
    });

    // ユーザーをログイン
    const { token } = await loginTestUser(app, testUser.email, 'password123');
    console.log("token", token);

    // マイクロポストを作成
    await Promise.all([
      createTestMicropost(prismaService, testUser.id),
      createTestMicropost(prismaService, testUser.id)
    ]);

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('imagePath');
    expect(response.body[0]).toHaveProperty('userId', testUser.id);
  });
});
