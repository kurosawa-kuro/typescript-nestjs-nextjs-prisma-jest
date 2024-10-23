import { Test, TestingModule } from '@nestjs/testing';
import { MicropostService } from '../../../src/micropost/micropost.service';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Micropost } from '@prisma/client';

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
      const expectedResult = [
        { id: 1, userId: 1, title: 'Micropost 1', imagePath: 'path1.jpg', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, userId: 2, title: 'Micropost 2', imagePath: 'path2.jpg', createdAt: new Date(), updatedAt: new Date() },
      ];

      jest.spyOn(prismaService.micropost, 'findMany').mockResolvedValue(expectedResult);

      const result = await service.all();
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single micropost', async () => {
      const id = 1;
      const expectedResult = { id, userId: 1, title: 'Micropost 1', imagePath: 'path1.jpg', createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.micropost, 'findUnique').mockResolvedValue(expectedResult);

      const result = await service.findById(id);
      expect(result).toEqual(expectedResult);
      expect(prismaService.micropost.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when micropost is not found', async () => {
      const id = 999;
      jest.spyOn(prismaService.micropost, 'findUnique').mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      expect(prismaService.micropost.findUnique).toHaveBeenCalledWith({ where: { id } });
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
