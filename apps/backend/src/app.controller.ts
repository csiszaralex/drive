import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from './configs/app-config.service';

@Controller()
export class AppController {
  constructor(private readonly configService: AppConfigService) {}

  @Get('health/version')
  getVersion() {
    return {
      version: this.configService.version,
      timestamp: new Date().toISOString(),
    };
  }
}
