import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function seed() {
  // 既存のデータを削除
  await prisma.$transaction(async (prisma) => {
    const tables = [
      'TeamMember', 'Team', 'Follow', 'Like', 'Comment', 'CategoryMicropost', 'Micropost', 
      'CareerProject', 'CareerSkill', 'Career', 'UserSkill', 'Skill',
      'UserRole', 'Role', 'UserProfile', 'User', 'Category'
    ];
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
      if (!['TeamMember', 'UserRole', 'Follow', 'UserProfile', 'CategoryMicropost', 'CareerSkill', 'UserSkill', 'Like'].includes(table)) {
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
      },
      profile: {
        create: {
          avatarPath: 'admin_avatar.png',
        },
      },
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
        profile: {
          create: {
            avatarPath: `${name.toLowerCase()}_avatar.png`,
          },
        },
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

  // Skills
  const skillNames = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'Go', 'TypeScript', 'SQL', 'HTML', 'CSS']
  const skills = await Promise.all(skillNames.map(name =>
    prisma.skill.create({
      data: { name }
    })
  ))

  // UserSkills
  await Promise.all(users.flatMap(user =>
    skills.slice(0, Math.floor(Math.random() * 5) + 1).map(skill =>
      prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: skill.id
        }
      })
    )
  ))

  // Careers
  const companies = ['Tech Corp', 'Innovate Inc', 'Digital Solutions', 'Future Systems', 'Code Masters']
  await Promise.all(users.flatMap(user =>
    Array(Math.floor(Math.random() * 3) + 1).fill(null).map((_, index) =>
      prisma.career.create({
        data: {
          userId: user.id,
          companyName: companies[Math.floor(Math.random() * companies.length)],
          skills: {
            create: skills.slice(0, Math.floor(Math.random() * 3) + 1).map(skill => ({
              skill: { connect: { id: skill.id } }
            }))
          },
          projects: {
            create: Array(Math.floor(Math.random() * 3) + 1).fill(null).map((_, projectIndex) => ({
              name: `Project ${projectIndex + 1}`
            }))
          }
        }
      })
    )
  ))

  // Comments
  const comments = ['Great post!', 'Interesting perspective', 'Thanks for sharing', 'I learned something new', 'Well written']
  await Promise.all(users.flatMap(user =>
    Array(Math.floor(Math.random() * 10) + 1).fill(null).map(() =>
      prisma.comment.create({
        data: {
          content: comments[Math.floor(Math.random() * comments.length)],
          userId: user.id,
          micropostId: Math.floor(Math.random() * users.length * 3) + 1
        }
      })
    )
  ))

  // Likes
  await Promise.all(users.flatMap(user =>
    Array(Math.floor(Math.random() * 20) + 1).fill(null).map(() =>
      prisma.like.create({
        data: {
          userId: user.id,
          micropostId: Math.floor(Math.random() * users.length * 3) + 1
        }
      }).catch(() => {
        // Ignore unique constraint violations
      })
    )
  ))

  console.log('Seed data inserted successfully, including 20 users, their relationships, teams, skills, careers, comments, and likes')
}
