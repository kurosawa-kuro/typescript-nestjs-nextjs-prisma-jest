import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/database/prisma.service';
import { User, Micropost } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

export const cleanupDatabase = async (
  prismaService: PrismaService,
): Promise<void> => {
  await prismaService.$transaction([
    prismaService.micropost.deleteMany(),
    prismaService.user.deleteMany(),
  ]);
};

interface TestUserData {
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  avatarPath?: string;
}

const defaultUserData: TestUserData = {
  name: 'Test User',
  email: `test${Math.random().toString(36).substring(2, 7)}@example.com`,
  password: 'testPassword123',
  isAdmin: false,
  avatarPath: 'path/to/avatar.jpg',
};

export const createTestUser = async (
  prismaService: PrismaService,
  userData: TestUserData = {}
): Promise<User> => {
  const mergedData = { ...defaultUserData, ...userData };
  const hashedPassword = await bcrypt.hash(mergedData.password, 10);

  return prismaService.user.create({
    data: {
      name: mergedData.name,
      email: mergedData.email,
      passwordHash: hashedPassword,
      isAdmin: mergedData.isAdmin,
      avatarPath: mergedData.avatarPath,
    },
  });
};

export const createTestMicropost = async (
  prismaService: PrismaService,
  userId: number,
): Promise<Micropost> => {
  return prismaService.micropost.create({
    data: {
      userId,
      title: 'Test Title',
      imagePath: 'test.jpg',
    },
  });
};
