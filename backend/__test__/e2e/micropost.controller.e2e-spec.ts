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

  describe('GET /microposts', () => {
    it('should return all microposts for authenticated user', async () => {
      // Arrange
      const testUser = await createTestUserWithMicroposts(prismaService);
      const { token } = await loginTestUser(app, testUser.email, 'password123');

      // Act
      const response = await request(app.getHttpServer())
        .get('/microposts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expectValidMicropost(response.body[0], testUser.id);
    });
  });
});

// Helper functions
async function createTestUserWithMicroposts(prismaService: PrismaService) {
  const testUser = await createTestUser(prismaService, {
    email: 'test@example.com',
    password: 'password123',
  });

  await Promise.all([
    createTestMicropost(prismaService, testUser.id),
    createTestMicropost(prismaService, testUser.id)
  ]);

  return testUser;
}

function expectValidMicropost(micropost: any, userId: number) {
  expect(micropost).toHaveProperty('id');
  expect(micropost).toHaveProperty('title');
  expect(micropost).toHaveProperty('imagePath');
  expect(micropost).toHaveProperty('userId', userId);
}
