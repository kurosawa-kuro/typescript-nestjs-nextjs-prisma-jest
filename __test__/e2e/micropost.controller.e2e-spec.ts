// micropost.controller.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import {
  setupTestApp,
  cleanupDatabase,
  createTestUser,
  createTestMicropost,
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

  it('/POST microposts', async () => {
    const user = await createTestUser(prismaService);
    const newMicropost = {
      userId: user.id,
      title: 'Test Title',
      imagePath: 'test.jpg',
    };

    const response = await request(app.getHttpServer())
      .post('/microposts')
      .send(newMicropost)
      .expect(201);

    expect(response.body).toMatchObject(newMicropost);
    expect(response.body).toHaveProperty('id');
  });

  it('/GET microposts', async () => {
    const user = await createTestUser(prismaService);
    await createTestMicropost(prismaService, user.id);
    await createTestMicropost(prismaService, user.id);

    const response = await request(app.getHttpServer())
      .get('/microposts')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('userId');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('imagePath');
  });
});
