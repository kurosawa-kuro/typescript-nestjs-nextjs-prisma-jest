// // user.e2e-spec.ts

// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { PrismaService } from '@/database/prisma.service';
// import { setupTestApp, cleanupDatabase, createTestUser } from './test-utils';

// describe('UserController (e2e)', () => {
//   let app: INestApplication;
//   let prismaService: PrismaService;

//   beforeAll(async () => {
//     ({ app, prismaService } = await setupTestApp());
//   });

//   afterAll(async () => {
//     await cleanupDatabase(prismaService);
//     await prismaService.$disconnect();
//     await app.close();
//   });

//   beforeEach(async () => {
//     await cleanupDatabase(prismaService);
//   });

//   it('/users (POST)', async () => {
//     const randomEmail = `${Math.random().toString(36).substring(2, 15)}@example.com`;
//     const newUser = {
//       name: 'Test User',
//       email: randomEmail,
//       password: 'hashedpassword',
//       isAdmin: false,
//       avatarPath: 'default_avatar.png',
//     };

//     const response = await request(app.getHttpServer())
//       .post('/users')
//       .send(newUser)
//       .expect(201);

//     console.log(response.body);

//     expect(response.body).toMatchObject(newUser);
//     expect(response.body.id).toBeDefined();
//   });

//   // it('/users (GET)', async () => {
//   //   const user1 = await createTestUser(prismaService);
//   //   const user2 = await createTestUser(prismaService);

//   //   const response = await request(app.getHttpServer())
//   //     .get('/users')
//   //     .expect(200);

//   //   expect(response.body).toHaveLength(2);
//   //   expect(response.body).toEqual(
//   //     expect.arrayContaining([
//   //       expect.objectContaining({
//   //         ...user1,
//   //         createdAt: expect.any(String),
//   //         updatedAt: expect.any(String),
//   //       }),
//   //       expect.objectContaining({
//   //         ...user2,
//   //         createdAt: expect.any(String),
//   //         updatedAt: expect.any(String),
//   //       }),
//   //     ])
//   //   );
//   // });
// });
