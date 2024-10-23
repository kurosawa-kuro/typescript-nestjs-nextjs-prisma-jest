// user.e2e-spec.ts

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/core/database/prisma.service';
import { setupTestApp, cleanupDatabase, createTestUser } from './test-utils';

describe('AuthController (e2e)', () => {
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

  it('/auth/register (POST)', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
      isAdmin: false,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Registration successful',
      token: expect.any(String),
      user: {
        id: expect.any(Number),
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });

    expect(response.headers['set-cookie'][0]).toContain('jwt=');
  });

  it('/auth/login (POST)', async () => {
    const testUser = {
      name: 'Test User',
      email: `test${Math.random().toString(36).substring(2, 7)}@example.com`,
      password: 'testPassword123',
      isAdmin: false,
      avatarPath: 'path/to/avatar.jpg',
    };
    await createTestUser(prismaService, testUser);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'Login successful',
      token: expect.any(String),
      user: {
        id: expect.any(Number),
        name: testUser.name,
        email: testUser.email,
        isAdmin: testUser.isAdmin,
      },
    });
  });
});
