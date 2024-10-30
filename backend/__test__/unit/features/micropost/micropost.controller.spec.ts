import { MicropostController } from '@/features/micropost/micropost.controller';
import { MicropostService } from '@/features/micropost/micropost.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DetailedMicropost } from '@/shared/types/micropost.types';
import { NotFoundException } from '@nestjs/common';
import { UserInfo } from '@/shared/types/user.types';

describe('MicropostController', () => {
  let controller: MicropostController;
  let service: MicropostService;

  const mockCurrentUser: UserInfo = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    userRoles: ['user'],
  };

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
      const data = { title: 'Test Micropost' };
      const mockImage = {
        filename: 'test-image.jpg'
      } as Express.Multer.File;

      const expectedResult: DetailedMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'test-image.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        user: {
          id: 1,
          name: 'Test User',
        },
        comments: []
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);
      
      const result = await controller.create(data, mockImage, mockCurrentUser);
      
      expect(service.create).toHaveBeenCalledWith({
        title: data.title,
        imagePath: mockImage.filename,
        user: {
          connect: { id: mockCurrentUser.id }
        }
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a micropost without image', async () => {
      const data = { title: 'Test Micropost' };

      const expectedResult: DetailedMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        imagePath: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        user: {
          id: 1,
          name: 'Test User',
        },
        comments: []
      };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);
      
      const result = await controller.create(data, null, mockCurrentUser);
      
      expect(service.create).toHaveBeenCalledWith({
        title: data.title,
        imagePath: null,
        user: {
          connect: { id: mockCurrentUser.id }
        }
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a detailed micropost', async () => {
      const id = '1';
      const expectedResponse: DetailedMicropost = {
        id: 1,
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'test.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        likesCount: 5,
        isLiked: false,
        user: {
          id: 1,
          name: 'Test User',
        },
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

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResponse);

      const result = await controller.findOne(id, mockCurrentUser);

      expect(result).toEqual(expectedResponse);
      expect(service.findOne).toHaveBeenCalledWith(1, mockCurrentUser.id);
    });

    it('should throw NotFoundException when micropost is not found', async () => {
      const id = '999';
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(id, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999, mockCurrentUser.id);
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
});
