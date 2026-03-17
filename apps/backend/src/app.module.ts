import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './configs/app-config.module';
import { FilesModule } from './files/files.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AppConfigModule, FilesModule],
  controllers: [AppController],
  providers: [PrismaService, { provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
