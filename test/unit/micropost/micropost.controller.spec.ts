import { Test, TestingModule } from '@nestjs/testing';
import { MicropostController } from '../../../src/micropost/micropost.controller';
import { MicropostService } from '../../../src/micropost/micropost.service';
import { Micropost } from '@prisma/client';
import { setupTestModule, createMockService } from '../test-utils';

describe('MicropostController', () => {
  let controller: MicropostController;
  let service: MicropostService;

  beforeEach(async () => {
    const mockMicropostService = createMockService(['createMicropost', 'getAllMicroposts']);
    const module = await setupTestModule(
      [MicropostController],
      [{ provide: MicropostService, useValue: mockMicropostService }]
    );

    controller = module.get<MicropostController>(MicropostController);
    service = module.get<MicropostService>(MicropostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMicropost', () => {
    it('should create a micropost', async () => {
      const micropostData: Omit<Micropost, 'id'> = {
        userId: 1,
        title: 'Test Title',
        imagePath: 'path/to/image.jpg',
      };
      const expectedResult: Micropost = { id: 1, ...micropostData };

      jest.spyOn(service, 'createMicropost').mockResolvedValue(expectedResult);

      const result = await controller.createMicropost(micropostData);
      expect(result).toEqual(expectedResult);
      expect(service.createMicropost).toHaveBeenCalledWith(micropostData);
    });
  });

  describe('getAllMicroposts', () => {
    it('should return an array of microposts', async () => {
      const expectedResult: Micropost[] = [
        { id: 1,   userId: 1, title: 'Title 1', imagePath: 'path1.jpg' },
        { id: 2,   userId: 2, title: 'Title 2', imagePath: 'path2.jpg' },
      ];

      jest.spyOn(service, 'getAllMicroposts').mockResolvedValue(expectedResult);

      const result = await controller.getAllMicroposts();
      expect(result).toEqual(expectedResult);
      expect(service.getAllMicroposts).toHaveBeenCalled();
    });
  });
});
