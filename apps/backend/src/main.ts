import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { EarlyDataGuard } from './common/early-data.guard';
import { AppConfigService } from './configs/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalGuards(new EarlyDataGuard());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  if (configService.get('SWAGGER_ENABLED')) setupSwagger(app);
  app.enableShutdownHooks();

  await app.listen(configService.port, '0.0.0.0');
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API docs')
    .setDescription('The docs for the api')
    .setVersion('1.0')
    .build();

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  };

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, customOptions);
}

void bootstrap();
