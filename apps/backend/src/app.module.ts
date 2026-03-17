import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './configs/app-config.module';
import { FilesModule } from './files/files.module';
import { PrismaService } from './prisma.service';
import { FoldersModule } from './folders/folders.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/global-exception.filter';

@Module({
  imports: [AppConfigModule, FilesModule, FoldersModule],
  controllers: [AppController],
  providers: [PrismaService, { provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
