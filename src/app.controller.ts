import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('add')
  async addSample(): Promise<string> {
    return this.appService.addSample('add');
  }

  @Get('all')
  async getAllSample(): Promise<string[]> {
    return this.appService.getAllSample();
  }
}
