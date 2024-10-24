import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function seed() {
  // 既存のデータを削除
  await prisma.$transaction(async (prisma) => {
    const tables = ['TeamMember', 'Team', 'Follow', 'Micropost', 'UserRole', 'Role', 'User'];
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      if (!['TeamMember', 'UserRole', 'Follow'].includes(table)) {
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
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('password', 10),
      userRoles: {
        create: roles.map(role => ({ roleId: role.id }))
      }
    },
  })

  // Regular users
  const userNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah',
    'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nora', 'Oscar', 'Pamela',
    'Quentin', 'Rachel', 'Samuel', 'Tina'
  ]

  const users = await Promise.all(userNames.map(async (name, index) => {
    return prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@example.com`,
        password: await bcrypt.hash('password', 10),
        avatarPath: `${name.toLowerCase()}_avatar.png`,
        userRoles: {
          create: [
            { roleId: roles.find(r => r.name === 'general')!.id },
            ...(index % 5 === 0 ? [{ roleId: roles.find(r => r.name === 'read_only_admin')!.id }] : [])
          ]
        }
      },
    })
  }))

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Art' } }),
    prisma.category.create({ data: { name: 'Technology' } }),
    prisma.category.create({ data: { name: 'Animal' } }),
  ])

  // Microposts
  await Promise.all(users.flatMap((user, index) => 
    Array(3).fill(null).map((_, postIndex) => 
      prisma.micropost.create({
        data: {
          userId: user.id,
          title: `${user.name}'s post ${postIndex + 1}`,
          imagePath: `${user.name.toLowerCase()}${postIndex + 1}.png`,
          categories: {
            create: [
              { categoryId: categories[index % 3].id },
            ],
          },
        },
      })
    )
  ))

  // Follows
  await Promise.all(users.flatMap((user, index) => 
    users
      .filter((_, followIndex) => followIndex !== index && Math.random() > 0.7)
      .map(followedUser => 
        prisma.follow.create({
          data: {
            followerId: user.id,
            followingId: followedUser.id,
          },
        })
      )
  ))

  // Teams
  const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team', 'Purple Team']
  const teams = await Promise.all(teamNames.map(name => 
    prisma.team.create({
      data: {
        name,
        description: `Description for ${name}`,
      }
    })
  ))

  // Team Members
  await Promise.all(users.map(user => 
    prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: teams[Math.floor(Math.random() * teams.length)].id,  // ランダムにチームを割り当て
      }
    })
  ))

  // 管理者をすべてのチームに所属させる
  await Promise.all(teams.map(team => 
    prisma.teamMember.create({
      data: {
        userId: adminUser.id,
        teamId: team.id,
      }
    })
  ))

  console.log('Seed data inserted successfully, including 20 users, their relationships, and teams')
}
