import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from '@/features/team/team.service';
import { PrismaService } from '@/core/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '@/features/user/user.service';

describe('TeamService', () => {
  let teamService: TeamService;
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        UserService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            teamMember: {
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    teamService = module.get<TeamService>(TeamService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const mockTeam = { id: 1, name: 'Test Team' }; // ownerId を削除
      (prismaService.team.create as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.create({ name: 'Test Team' });

      expect(prismaService.team.create).toHaveBeenCalledWith({
        data: { name: 'Test Team' }, // ownerId を削除
        include: { members: true }, // include を追加
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getTeam', () => {
    it('should return a team if it exists', async () => {
      const mockTeam = { id: 1, name: 'Test Team', ownerId: 1 };
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.findById(1);

      expect(prismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('all', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        { id: 1, name: 'Test Team', members: [] }, // members を追加
        { id: 2, name: 'Test Team 2', members: [] }, // members を追加
      ];

      (prismaService.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

      const result = await teamService.all();

      expect(result).toEqual(mockTeams);
    });
  });
});
