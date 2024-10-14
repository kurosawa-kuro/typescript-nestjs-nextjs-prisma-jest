import { Test, TestingModule } from '@nestjs/testing';
import { MicropostService } from './micropost.service';
import { PrismaService } from '../database/prisma.service';

describe('MicropostService', () => {
  let micropostService: MicropostService;
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
            },
          },
        },
      ],
    }).compile();

    micropostService = module.get<MicropostService>(MicropostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createMicropost', () => {
    it('should create a micropost', async () => {
      const micropostData = { 
        content: 'Test content', 
        userId: 1,
        title: 'Test Title',
        imagePath: 'path/to/image.jpg'
      };
      const expectedMicropost = { id: 1, ...micropostData };
      
      (prismaService.micropost.create as jest.Mock).mockResolvedValue(expectedMicropost);

      const result = await micropostService.createMicropost(micropostData);
      expect(result).toEqual(expectedMicropost);
      expect(prismaService.micropost.create).toHaveBeenCalledWith({ data: micropostData });
    });
  });

  describe('getAllMicroposts', () => {
    it('should return all microposts', async () => {
      const expectedMicroposts = [
        { id: 1, content: 'Micropost 1', userId: 1 },
        { id: 2, content: 'Micropost 2', userId: 2 },
      ];
      
      (prismaService.micropost.findMany as jest.Mock).mockResolvedValue(expectedMicroposts);

      const result = await micropostService.getAllMicroposts();
      expect(result).toEqual(expectedMicroposts);
      expect(prismaService.micropost.findMany).toHaveBeenCalled();
    });
  });
});
