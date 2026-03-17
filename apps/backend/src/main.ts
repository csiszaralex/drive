import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EarlyDataGuard } from './common/early-data.guard';
import { AppConfigService } from './configs/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  app.setGlobalPrefix('storage');
  app.useGlobalGuards(new EarlyDataGuard());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  await app.listen(configService.port, '0.0.0.0');
}

void bootstrap();
