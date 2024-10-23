import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Team, Prisma } from '@prisma/client';
import { BaseService } from '@/core/common/base.service';

@Injectable()
export class TeamService extends BaseService<
  Team,
  Prisma.TeamCreateInput,
  Prisma.TeamUpdateInput,
  Prisma.TeamWhereUniqueInput,
  Prisma.TeamWhereInput
> {
  protected entityName = 'Team';

  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected getRepository() {
    return this.prisma.team;
  }

  // Create (C)
  override async create(data: Prisma.TeamCreateInput): Promise<Team> {
    try {
      return await this.prisma.team.create({
        data,
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Team name already exists');
      }
      throw error;
    }
  }

  // Read (R)
  override async all(): Promise<Team[]> {
    return this.prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarPath: true,
              },
            },
          },
        },
      },
    });
  }

  // Update (U)
  async updateTeamPrivacy(id: number, isPrivate: boolean): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return this.prisma.team.update({
      where: { id },
      data: { isPrivate },
    });
  }

  // Delete (D)
  // Using the default destroy method from BaseService

  // Team Member operations
  async addMember(teamId: number, userId: number): Promise<Team> {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarPath: true,
              },
            },
          },
        },
      },
    });
  }

  async removeMember(teamId: number, userId: number): Promise<Team> {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          delete: {
            userId_teamId: {
              userId,
              teamId,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarPath: true,
              },
            },
          },
        },
      },
    });
  }
}
