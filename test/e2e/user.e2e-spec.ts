// user.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { User } from '@prisma/client';

describe('UserController (e2e)', () => {
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

  const createTestUser = async (email: string): Promise<User> => {
    return prismaService.user.create({
      data: {
        name: 'Test User',
        email: email,
        passwordHash: 'hashedpassword',
        isAdmin: false,
        avatarPath: 'default_avatar.png'
      }
    });
  };

  it('/users (POST)', async () => {
    const randomEmail = `${Math.random().toString(36).substring(2, 15)}@example.com`;
    const newUser = {
      name: 'Test User',
      email: randomEmail,
      passwordHash: 'hashedpassword',
      isAdmin: false,
      avatarPath: 'default_avatar.png'
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toMatchObject(newUser);
    expect(response.body.id).toBeDefined();
  });

  it('/users (GET)', async () => {
    const randomEmail1 = `${Math.random().toString(36).substring(2, 15)}@example.com`;
    const randomEmail2 = `${Math.random().toString(36).substring(2, 15)}@example.com`;
    
    const user1 = await createTestUser(randomEmail1);
    const user2 = await createTestUser(randomEmail2);

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining(user1),
      expect.objectContaining(user2)
    ]));
  });
});