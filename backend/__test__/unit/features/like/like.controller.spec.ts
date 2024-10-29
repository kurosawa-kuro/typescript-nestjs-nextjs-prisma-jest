import { Test, TestingModule } from '@nestjs/testing';
import { LikeController } from '@/features/like/like.controller';
import { LikeService } from '@/features/like/like.service';

describe('LikeController', () => {
  let controller: LikeController;
  let service: LikeService;

  const mockLikeService = {
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeController],
      providers: [
        {
          provide: LikeService,
          useValue: mockLikeService,
        },
      ],
    }).compile();

    controller = module.get<LikeController>(LikeController);
    service = module.get<LikeService>(LikeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a like', async () => {
      const micropostId = '1';
      const userId = { id: 1 };
      const expectedResult = { id: 1, micropostId: 1, userId: 1 };

      mockLikeService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(micropostId, userId);

      expect(service.create).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a like', async () => {
      const micropostId = '1';
      const userId = { id: 1 };
      const expectedResult = { success: true };

      mockLikeService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(micropostId, userId);

      expect(service.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(expectedResult);
    });
  });
});
