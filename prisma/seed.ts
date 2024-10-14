import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function seed() {
  // Admin user
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('password', 10),
      isAdmin: true,
    },
  })

  // Regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        avatarPath: 'alice_avatar.png',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        avatarPath: 'bob_avatar.png',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Charlie',
        email: 'charlie@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        avatarPath: 'charlie_avatar.png',
      },
    }),
  ])

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { title: 'Art' } }),
    prisma.category.create({ data: { title: 'Technology' } }),
    prisma.category.create({ data: { title: 'Animal' } }),
  ])

  // Microposts
  await Promise.all([
    prisma.micropost.create({
      data: {
        userId: users[0].id,
        title: 'Alice\'s first post',
        imagePath: 'alice1.png',
        categories: {
          create: [
            { categoryId: categories[0].id },
            { categoryId: categories[2].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[0].id,
        title: 'Alice\'s second post',
        imagePath: 'alice2.png',
        categories: {
          create: [
            { categoryId: categories[0].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[1].id,
        title: 'Bob\'s post',
        imagePath: 'bob1.png',
        categories: {
          create: [
            { categoryId: categories[0].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[0].id,
        title: 'Alice\'s third post',
        imagePath: 'alice3.png',
        categories: {
          create: [
            { categoryId: categories[2].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[2].id,
        title: 'Charlie\'s first post',
        imagePath: 'charlie1.png',
        categories: {
          create: [
            { categoryId: categories[1].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[1].id,
        title: 'Bob\'s second post',
        imagePath: 'bob2.png',
        categories: {
          create: [
            { categoryId: categories[0].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[2].id,
        title: 'Charlie\'s second post',
        imagePath: 'charlie2.png',
        categories: {
          create: [
            { categoryId: categories[1].id },
          ],
        },
      },
    }),
    prisma.micropost.create({
      data: {
        userId: users[2].id,
        title: 'Charlie\'s third post',
        imagePath: 'charlie3.png',
        categories: {
          create: [
            { categoryId: categories[1].id },
          ],
        },
      },
    }),
  ])

  console.log('Seed data inserted successfully')
}