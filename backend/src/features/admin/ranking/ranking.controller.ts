import { Controller, Get } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('admin/ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // マイクロポストのランキングを取得
  @Get()
  getMicropostRanking() {
    return this.rankingService.getMicropostRanking();
  }
} 