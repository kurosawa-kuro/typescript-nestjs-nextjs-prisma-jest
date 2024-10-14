// micropost.controller.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { Micropost, User } from '@prisma/client';

describe('MicropostController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.$connect();
  });

  afterAll(async () => {
    await prismaService.$transaction([
      prismaService.micropost.deleteMany(),
      prismaService.user.deleteMany(),
    ]);
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prismaService.$transaction([
      prismaService.micropost.deleteMany(),
      prismaService.user.deleteMany(),
    ]);
  });

  const createTestUser = async (): Promise<User> => {
    return prismaService.user.create({
      data: {
        name: 'Test User',
        email: `${Math.random().toString(36).substring(2, 15)}@example.com`,
        passwordHash: 'hashedPassword',
        isAdmin: false,
        avatarPath: 'path/to/avatar.jpg',
      },
    });
  };

  const createTestMicropost = async (userId: number): Promise<Micropost> => {
    return prismaService.micropost.create({
      data: {
        userId,
        title: 'Test Title',
        imagePath: 'test.jpg',
      },
    });
  };

  it('/POST microposts', async () => {
    const user = await createTestUser();
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
    const user = await createTestUser();
    await createTestMicropost(user.id);
    await createTestMicropost(user.id);

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
