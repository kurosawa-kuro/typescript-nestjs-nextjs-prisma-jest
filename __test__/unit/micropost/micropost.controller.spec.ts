import { MicropostController } from '../../../src/micropost/micropost.controller';
import { MicropostService } from '../../../src/micropost/micropost.service';
import { Micropost } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { setupTestModule, createMockService } from '../test-utils';

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
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'path/to/image.jpg',
      };
      const expectedResult = { id: 1, ...micropostData };
      
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);
      
      const result = await controller.create(micropostData);
      
      expect(service.create).toHaveBeenCalledWith(micropostData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of microposts', async () => {
      const expectedResult = [
        { id: 1, userId: 1, title: 'Micropost 1', imagePath: 'path1.jpg' },
        { id: 2, userId: 2, title: 'Micropost 2', imagePath: 'path2.jpg' },
      ];
      
      jest.spyOn(service, 'all').mockResolvedValue(expectedResult);
      
      const result = await controller.index();
      
      expect(result).toEqual(expectedResult);
    });
  });
});
