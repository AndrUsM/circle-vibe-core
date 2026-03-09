import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/index';

import { ENCRYPTION_FIELDS_EXTENSION } from './constants';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const isProd = process.env.NODE_ENV === 'production';

    super({
      errorFormat: 'minimal',
      ...(isProd
        ? { accelerateUrl: String(process.env.PRISMA_ACCELERATE_URL) }
        : {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            adapter: new PrismaPg({
              connectionString: String(process.env.DATABASE_URL),
            }),
          }),
    });

    this.$extends(ENCRYPTION_FIELDS_EXTENSION);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
