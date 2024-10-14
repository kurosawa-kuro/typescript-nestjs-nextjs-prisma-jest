import { Test, TestingModule } from '@nestjs/testing';
import { DevelopService } from '@/develop//develop.service';
import { PrismaService } from '@/database/prisma.service';
import { seed } from '../../../prisma/seed';

// seedをモック化
jest.mock('../../../prisma/seed', () => ({
  seed: jest.fn(),
}));

describe('DevelopService', () => {
  let service: DevelopService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevelopService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            micropost: {
              deleteMany: jest.fn(),
            },
            user: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DevelopService>(DevelopService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resetDb', () => {
    it('should delete all microposts and users, then seed the database', async () => {
      // Arrange
      prismaService.$transaction.mockResolvedValue(undefined);
      (seed as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.resetDb();

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.micropost.deleteMany(),
        prismaService.user.deleteMany(),
      ]);
      expect(seed).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Database has been reset.' });
    });

    it('should throw an error if transaction fails', async () => {
      // Arrange
      const error = new Error('Transaction failed');
      prismaService.$transaction.mockRejectedValue(error);

      // Act & Assert
      await expect(service.resetDb()).rejects.toThrow('Transaction failed');
    });

    it('should throw an error if seeding fails', async () => {
      // Arrange
      prismaService.$transaction.mockResolvedValue(undefined);
      const error = new Error('Seeding failed');
      (seed as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(service.resetDb()).rejects.toThrow('Seeding failed');
    });
  });
});
