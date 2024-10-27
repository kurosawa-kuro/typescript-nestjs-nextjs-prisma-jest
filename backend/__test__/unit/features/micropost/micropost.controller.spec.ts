import { MicropostController } from '@/features/micropost/micropost.controller';
import { MicropostService } from '@/features/micropost/micropost.service';
import { Test, TestingModule } from '@nestjs/testing';
import { setupTestModule, createMockService } from '../../test-utils';
import { DetailedMicropost } from '@/shared/types/micropost.types';
import { NotFoundException } from '@nestjs/common';

describe('MicropostController', () => {
  let controller: MicropostController;
  let service: MicropostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicropostController],
      providers: [
        {
          provide: MicropostService,
          useValue: {
            create: jest.fn(),
            all: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MicropostController>(MicropostController);
    service = module.get<MicropostService>(MicropostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a micropost', async () => {
      const micropostData = {
        title: 'Test Micropost',
        imagePath: 'path/to/image.jpg',
        userId: 1,
        user: { connect: { id: 1 } },
      };
      const expectedResult = {
        id: 1,
        ...micropostData,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);
      
      const result = await controller.create(micropostData);
      
      expect(service.create).toHaveBeenCalledWith(micropostData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('index', () => {
    it('should return an array of detailed microposts', async () => {
      const expectedResult: DetailedMicropost[] = [
        {
          id: 1,
          userId: 1,
          title: 'Micropost 1',
          imagePath: 'path1.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likesCount: 5,
          user: { id: 1, name: 'User 1' },
          comments: [],
        },
        {
          id: 2,
          userId: 2,
          title: 'Micropost 2',
          imagePath: 'path2.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likesCount: 3,
          user: { id: 2, name: 'User 2' },
          comments: [],
        },
      ];
      
      jest.spyOn(service, 'all').mockResolvedValue(expectedResult);
      
      const result = await controller.index();
      
      expect(service.all).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a detailed micropost', async () => {
      const id = '1';
      const expectedResult: DetailedMicropost = {
        id: 1,
        userId: 1,
        title: 'Micropost 1',
        imagePath: 'path1.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 5,
        user: { id: 1, name: 'User 1' },
        comments: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when micropost is not found', async () => {
      const id = '999';

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });
});
