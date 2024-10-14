import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
  });

  it('/users (POST)', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
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
    const user1 = await prismaService.user.create({
      data: {
        name: 'User 1',
        email: 'user1@example.com',
        passwordHash: 'hashedpassword1',
        isAdmin: false,
        avatarPath: 'avatar1.png'
      }
    });

    const user2 = await prismaService.user.create({
      data: {
        name: 'User 2',
        email: 'user2@example.com',
        passwordHash: 'hashedpassword2',
        isAdmin: true,
        avatarPath: 'avatar2.png'
      }
    });

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