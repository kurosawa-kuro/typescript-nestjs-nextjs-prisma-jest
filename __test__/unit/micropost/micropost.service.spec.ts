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

  describe('create', () => {
    it('should create a micropost', async () => {
      const micropostData = {
        userId: 1,
        title: 'Test Micropost',
        imagePath: 'path/to/image.jpg',
      };
      
      // Mock the create method to return the input data
      (prismaService.micropost.create as jest.Mock).mockResolvedValue(micropostData);
      
      const result = await micropostService.create(micropostData);
      
      // Log the result for debugging
      console.log('Create result:', result);
      
      expect(prismaService.micropost.create).toHaveBeenCalledWith({
        data: micropostData,
      });
      expect(result).toEqual(expect.objectContaining(micropostData));
    });
  });

  describe('all', () => {
    it('should get all microposts', async () => {
      const expectedMicroposts = [
        { id: 1, userId: 1, title: 'Micropost 1', imagePath: 'path1.jpg' },
        { id: 2, userId: 2, title: 'Micropost 2', imagePath: 'path2.jpg' },
      ];
      
      (prismaService.micropost.findMany as jest.Mock).mockResolvedValue(expectedMicroposts);
      
      const result = await micropostService.all();
      
      expect(prismaService.micropost.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedMicroposts);
    });
  });
});
