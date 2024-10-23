import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function seed() {

  // 既存のデータを削除
  await prisma.$transaction(async (prisma) => {
    // テーブル名のリスト
    const tables = ['Follow', 'Micropost', 'UserRole', 'Role', 'User'];

    for (const table of tables) {
      // データを削除
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      
      // IDシーケンスをリセット ただしFollowとUserRoleはidが無いので対象外
      if (table !== 'UserRole' && table !== 'Follow') {
        await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1`);
      }
    }
  });

  // Roles
  const roles = await Promise.all([
    prisma.role.create({ data: { name: 'general', description: '一般ユーザー' } }),
    prisma.role.create({ data: { name: 'read_only_admin', description: '閲覧限定アドミン' } }),
    prisma.role.create({ data: { name: 'admin', description: 'フルアクセス権限を持つアドミン' } }),
  ])

  // Admin user
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      userRoles: {
        create: [
          { roleId: roles.find(r => r.name === 'admin')!.id },
          { roleId: roles.find(r => r.name === 'read_only_admin')!.id },
          { roleId: roles.find(r => r.name === 'general')!.id }
        ],
        
      }
    },
  })

  // Regular users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        password: await bcrypt.hash('password', 10),
        avatarPath: 'alice_avatar.png',
        userRoles: {
          create: [{ roleId: roles.find(r => r.name === 'general')!.id }]
        }
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        password: await bcrypt.hash('password', 10),
        avatarPath: 'bob_avatar.png',
        userRoles: {
          create: [{ roleId: roles.find(r => r.name === 'general')!.id },
            { roleId: roles.find(r => r.name ==='read_only_admin')!.id }
          ]
        }
      },
    }),
    prisma.user.create({
      data: {
        name: 'Charlie',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password', 10),
        avatarPath: 'charlie_avatar.png',
        userRoles: {
          create: [{ roleId: roles.find(r => r.name === 'read_only_admin')!.id }]
        }
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

  // Followのシードデータを追加
  await Promise.all([
    // Aliceが他のユーザーをフォロー
    prisma.follow.create({
      data: {
        followerId: users[0].id, // Alice
        followedId: users[1].id, // Bob
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[0].id, // Alice
        followedId: users[2].id, // Charlie
      },
    }),

    // Bobが他のユーザーをフォロー
    prisma.follow.create({
      data: {
        followerId: users[1].id, // Bob
        followedId: users[0].id, // Alice
      },
    }),

    // Charlieが他のユーザーをフォロー
    prisma.follow.create({
      data: {
        followerId: users[2].id, // Charlie
        followedId: users[0].id, // Alice
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id, // Charlie
        followedId: users[1].id, // Bob
      },
    }),
  ]);

  console.log('Seed data inserted successfully, including Follow relationships')
}
