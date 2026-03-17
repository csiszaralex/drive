import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfigService } from './configs/app-config.service';
import { Prisma, PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfigService) {
    const adapter = new PrismaPg({ connectionString: config.get('DATABASE_URL') });
    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.debug(`[Prisma Query] ${e.query} - ${e.duration}ms`);
    });
    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logger.log(`[Prisma Info] ${e.message}`);
    });
    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn(`[Prisma Warn] ${e.message}`);
    });
    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error(`[Prisma Error] ${e.message}`);
    });

    await this.$connect();
    this.logger.log('Sikeresen csatlakozott az adatbázishoz.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Adatbázis kapcsolat lezárva.');
  }
}
