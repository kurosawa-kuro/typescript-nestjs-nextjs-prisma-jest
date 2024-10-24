import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createEntities<T>(count: number, createFn: (index: number) => Promise<T>): Promise<T[]> {
  return Promise.all(Array(count).fill(null).map((_, index) => createFn(index)))
}

async function createRandomEntities<T>(
  minCount: number,
  maxCount: number,
  createFn: (index: number) => Promise<T>
): Promise<T[]> {
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount
  return createEntities(count, createFn)
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function seed() {
  // Clear existing data
  const tables = [
    'TeamMember', 'Team', 'Follow', 'Like', 'Comment', 'CategoryMicropost', 'Micropost', 
    'CareerProject', 'CareerSkill', 'Career', 'UserSkill', 'Skill',
    'UserRole', 'Role', 'UserProfile', 'User', 'Category'
  ]
  await prisma.$transaction(
    tables.map(table => prisma.$executeRawUnsafe(`DELETE FROM "${table}"`))
      .concat(tables.filter(table => !['TeamMember', 'UserRole', 'Follow', 'UserProfile', 'CategoryMicropost', 'CareerSkill', 'UserSkill', 'Like'].includes(table))
        .map(table => prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1`)))
  )

  // Create roles
  const roleData = [
    { name: 'general', description: '一般ユーザー' },
    { name: 'read_only_admin', description: '閲覧限定アドミン' },
    { name: 'admin', description: 'フルアクセス権限を持つアドミン' },
  ]
  const roles = await createEntities(roleData.length, (i) => prisma.role.create({ data: roleData[i] }))

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: await hashPassword('password'),
      userRoles: { create: roles.map(role => ({ roleId: role.id })) },
      profile: { create: { avatarPath: 'admin_avatar.png' } },
    },
  })

  // Create regular users
  const userNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah',
    'Ian', 'Julia', 'Kevin', 'Laura', 'Michael', 'Nora', 'Oscar', 'Pamela',
    'Quentin', 'Rachel', 'Samuel', 'Tina'
  ]
  const users = await createEntities(userNames.length, async (i) => {
    const name = userNames[i]
    return prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@example.com`,
        password: await hashPassword('password'),
        profile: { create: { avatarPath: `${name.toLowerCase()}_avatar.png` } },
        userRoles: {
          create: [
            { roleId: roles.find(r => r.name === 'general')!.id },
            ...(i % 5 === 0 ? [{ roleId: roles.find(r => r.name === 'read_only_admin')!.id }] : [])
          ]
        }
      },
    })
  })

  // Create categories
  const categoryNames = ['Art', 'Technology', 'Animal']
  const categories = await createEntities(categoryNames.length, (i) => 
    prisma.category.create({ data: { name: categoryNames[i] } })
  )

  // Create microposts
  await Promise.all(users.flatMap((user, index) => 
    createEntities(3, (postIndex) => 
      prisma.micropost.create({
        data: {
          userId: user.id,
          title: `${user.name}'s post ${postIndex + 1}`,
          imagePath: `${user.name.toLowerCase()}${postIndex + 1}.png`,
          categories: { create: [{ categoryId: categories[index % 3].id }] },
        },
      })
    )
  ))

  // Create follows
  await Promise.all(users.flatMap((user, index) => 
    users
      .filter((_, followIndex) => followIndex !== index && Math.random() > 0.7)
      .map(followedUser => 
        prisma.follow.create({
          data: { followerId: user.id, followingId: followedUser.id },
        })
      )
  ))

  // Create teams and team members
  const teamNames = ['Red Team', 'Blue Team', 'Green Team', 'Yellow Team', 'Purple Team']
  const teams = await createEntities(teamNames.length, (i) => 
    prisma.team.create({
      data: { name: teamNames[i], description: `Description for ${teamNames[i]}` },
    })
  )

  await Promise.all(users.map(user => 
    prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: teams[Math.floor(Math.random() * teams.length)].id,
      }
    })
  ))

  await Promise.all(teams.map(team => 
    prisma.teamMember.create({
      data: { userId: adminUser.id, teamId: team.id },
    })
  ))

  // Create skills and user skills
  const skillNames = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'Go', 'TypeScript', 'SQL', 'HTML', 'CSS']
  const skills = await createEntities(skillNames.length, (i) => 
    prisma.skill.create({ data: { name: skillNames[i] } })
  )

  await Promise.all(users.map(async user => {
    const userSkills = await createRandomEntities(1, 5, async () => ({
      userId: user.id,
      skillId: skills[Math.floor(Math.random() * skills.length)].id
    }))
    
    return prisma.userSkill.createMany({
      data: userSkills,
      skipDuplicates: true
    })
  }))

  // Create careers
  const companies = ['Tech Corp', 'Innovate Inc', 'Digital Solutions', 'Future Systems', 'Code Masters']
  await Promise.all(users.map(user =>
    createRandomEntities(1, 3, async () => {
      const career = await prisma.career.create({
        data: {
          userId: user.id,
          companyName: companies[Math.floor(Math.random() * companies.length)],
          projects: {
            create: await createRandomEntities(1, 3, async (projectIndex) => ({
              name: `Project ${projectIndex + 1}`
            }))
          }
        }
      })

      const careerSkills = Array(Math.floor(Math.random() * 3) + 1).fill(null).map(() => ({
        careerId: career.id,
        skillId: skills[Math.floor(Math.random() * skills.length)].id
      }))

      await prisma.careerSkill.createMany({
        data: careerSkills,
        skipDuplicates: true
      })

      return career
    })
  ))

  // Create comments
  const commentContents = ['Great post!', 'Interesting perspective', 'Thanks for sharing', 'I learned something new', 'Well written']
  await Promise.all(users.flatMap(user =>
    createRandomEntities(1, 10, () =>
      prisma.comment.create({
        data: {
          content: commentContents[Math.floor(Math.random() * commentContents.length)],
          userId: user.id,
          micropostId: Math.floor(Math.random() * users.length * 3) + 1
        }
      })
    )
  ))

  // Create likes
  await Promise.all(users.flatMap(user =>
    createRandomEntities(1, 20, () =>
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

  console.log('Seed data inserted successfully, including users, relationships, teams, skills, careers, comments, and likes')
}
