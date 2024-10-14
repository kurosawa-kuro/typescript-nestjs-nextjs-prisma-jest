import { MicropostService } from '../../../src/micropost/micropost.service';
import { PrismaService } from '@/database/prisma.service';
import { createMockPrismaService, setupTestModule } from '../test-utils';

describe('MicropostService', () => {
  let micropostService: MicropostService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await setupTestModule(
      [],
      [
        MicropostService,
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    );

    micropostService = module.get<MicropostService>(MicropostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createMicropost', () => {
    it('should create a micropost', async () => {
      const micropostData = {
        userId: 1,
        title: 'Test Title',
        imagePath: 'path/to/image.jpg',
      };
      const expectedMicropost = { id: 1, ...micropostData };

      (prismaService.micropost.create as jest.Mock).mockResolvedValue(
        expectedMicropost,
      );

      const result = await micropostService.createMicropost(micropostData);
      expect(result).toEqual(expectedMicropost);
      expect(prismaService.micropost.create).toHaveBeenCalledWith({
        data: micropostData,
      });
    });
  });

  describe('getAllMicroposts', () => {
    it('should return all microposts', async () => {
      const expectedMicroposts = [
        { id: 1, title: 'Micropost 1', userId: 1 },
        { id: 2, title: 'Micropost 2', userId: 2 },
      ];

      (prismaService.micropost.findMany as jest.Mock).mockResolvedValue(
        expectedMicroposts,
      );

      const result = await micropostService.getAllMicroposts();
      expect(result).toEqual(expectedMicroposts);
      expect(prismaService.micropost.findMany).toHaveBeenCalled();
    });
  });
});
