import { Test, TestingModule } from '@nestjs/testing';
import { MicropostService } from '@/features/micropost/micropost.service';
import { PrismaService } from '@/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Micropost } from '@prisma/client';
import { DetailedMicropost } from '@/shared/types/micropost.types';

describe('MicropostService', () => {
  let service: MicropostService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicropostService,
        {
          provide: PrismaService,
          useValue: {
            micropost: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MicropostService>(MicropostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new micropost', async () => {
      const micropostData = {
        user: { connect: { id: 1 } },
        title: 'Test Micropost',
        imagePath: 'test.jpg',
      };
      const expectedResult = { id: 1, userId: 1, ...micropostData, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.micropost, 'create').mockResolvedValue(expectedResult);

      const result = await service.create(micropostData);
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.create).toHaveBeenCalledWith({ data: micropostData });
    });
  });

  describe('all', () => {
    it('should return all microposts', async () => {
      const mockMicroposts = [
        {
          id: 1,
          userId: 1,
          title: 'Micropost 1',
          imagePath: 'path1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 1,
            name: 'User 1',
          },
          _count: {
            likes: 5,
          },
          comments: [],
        },
        {
          id: 2,
          userId: 2,
          title: 'Micropost 2',
          imagePath: 'path2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 2,
            name: 'User 2',
          },
          _count: {
            likes: 3,
          },
          comments: [],
        },
      ];

      const expectedResult = mockMicroposts.map(micropost => ({
        ...micropost,
        createdAt: micropost.createdAt.toISOString(),
        updatedAt: micropost.updatedAt.toISOString(),
        user: {
          id: micropost.user.id,
          name: micropost.user.name,
        },
        likesCount: micropost._count.likes,
        comments: [],
      }));

      jest.spyOn(prismaService.micropost, 'findMany').mockResolvedValue(mockMicroposts);

      const result = await service.all();
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      avatarPath: true
                    }
                  }
                }
              }
            }
          }
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a detailed micropost when found', async () => {
      const id = 1;
      const mockMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'test.jpg',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        user: {
          id: 1,
          name: 'Test User',
        },
        _count: {
          likes: 5,
        },
        comments: [
          {
            id: 1,
            content: 'Test Comment',
            userId: 2,
            micropostId: 1,
            createdAt: new Date('2023-01-03T00:00:00Z'),
            updatedAt: new Date('2023-01-03T00:00:00Z'),
            user: {
              id: 2,
              name: 'Commenter',
              profile: {
                avatarPath: 'commenter-avatar.jpg',
              },
            },
          },
        ],
      };

      const expectedResult: DetailedMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'test.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        user: {
          id: 1,
          name: 'Test User',
        },
        likesCount: 5,
        comments: [
          {
            id: 1,
            content: 'Test Comment',
            userId: 2,
            micropostId: 1,
            createdAt: '2023-01-03T00:00:00.000Z',
            updatedAt: '2023-01-03T00:00:00.000Z',
            user: {
              id: 2,
              name: 'Commenter',
              profile: {
                avatarPath: 'commenter-avatar.jpg',
              },
            },
          },
        ],
      };

      jest.spyOn(prismaService.micropost, 'findUnique').mockResolvedValue(mockMicropost);

      const result = await service.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      avatarPath: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should return null when micropost is not found', async () => {
      const id = 999;

      jest.spyOn(prismaService.micropost, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
      expect(prismaService.micropost.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update a micropost', async () => {
      const id = 1;
      const updateData = { title: 'Updated Micropost' };
      const expectedResult = { id, userId: 1, ...updateData, imagePath: 'path1.jpg', createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.micropost, 'update').mockResolvedValue(expectedResult);

      const result = await service.update(id, updateData);
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });

    it('should throw NotFoundException when micropost to update is not found', async () => {
      const id = 999;
      const updateData = { title: 'Updated Micropost' };

      jest.spyOn(prismaService.micropost, 'update').mockRejectedValue({ code: 'P2025' });

      await expect(service.update(id, updateData)).rejects.toThrow(NotFoundException);
      expect(prismaService.micropost.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData,
      });
    });

    it('should throw the original error for other update errors', async () => {
      const id = 1;
      const updateData = { title: 'Updated Micropost' };

      const originalError = new Error('Database connection error');
      jest.spyOn(prismaService.micropost, 'update').mockRejectedValue(originalError);

      await expect(service.update(id, updateData)).rejects.toThrow(originalError);
    });
  });

  describe('remove', () => {
    it('should remove a micropost', async () => {
      const id = 1;
      const expectedResult = { id, userId: 1, title: 'Deleted Micropost', imagePath: 'path1.jpg', createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.micropost, 'delete').mockResolvedValue(expectedResult);

      const result = await service.destroy(id);
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when micropost to delete is not found', async () => {
      const id = 999;

      jest.spyOn(prismaService.micropost, 'delete').mockRejectedValue({ code: 'P2025' });

      await expect(service.destroy(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.micropost.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw the original error for other delete errors', async () => {
      const id = 1;

      const originalError = new Error('Database connection error');
      jest.spyOn(prismaService.micropost, 'delete').mockRejectedValue(originalError);

      await expect(service.destroy(id)).rejects.toThrow(originalError);
    });
  });

  describe('findByUserId', () => {
    it('should return microposts for a given user ID', async () => {
      const userId = 1;
      const expectedMicroposts = [
        { id: 1, userId: 1, title: 'Post 1', imagePath: 'path1.jpg', createdAt: new Date('2023-01-02'), updatedAt: new Date() },
        { id: 2, userId: 1, title: 'Post 2', imagePath: 'path2.jpg', createdAt: new Date('2023-01-01'), updatedAt: new Date() },
      ];

      jest.spyOn(prismaService.micropost, 'findMany').mockResolvedValue(expectedMicroposts);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(expectedMicroposts);
      expect(prismaService.micropost.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return an empty array if no microposts found for the user', async () => {
      const userId = 999;
      const expectedMicroposts: Micropost[] = [];

      jest.spyOn(prismaService.micropost, 'findMany').mockResolvedValue(expectedMicroposts);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(expectedMicroposts);
      expect(prismaService.micropost.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw an error if the database query fails', async () => {
      const userId = 1;
      const databaseError = new Error('Database connection error');

      jest.spyOn(prismaService.micropost, 'findMany').mockRejectedValue(databaseError);

      await expect(service.findByUserId(userId)).rejects.toThrow(databaseError);
      expect(prismaService.micropost.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
