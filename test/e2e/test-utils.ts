import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { User, Micropost } from '@prisma/client';

export const setupTestApp = async (): Promise<{
  app: INestApplication;
  prismaService: PrismaService;
}> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const prismaService = app.get<PrismaService>(PrismaService);
  await prismaService.$connect();

  return { app, prismaService };
};

export const cleanupDatabase = async (prismaService: PrismaService): Promise<void> => {
  await prismaService.$transaction([
    prismaService.micropost.deleteMany(),
    prismaService.user.deleteMany(),
  ]);
};

export const createTestUser = async (prismaService: PrismaService): Promise<User> => {
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

export const createTestMicropost = async (prismaService: PrismaService, userId: number): Promise<Micropost> => {
  return prismaService.micropost.create({
    data: {
      userId,
      title: 'Test Title',
      imagePath: 'test.jpg',
    },
  });
};
