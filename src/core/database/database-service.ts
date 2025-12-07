import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/index';
import { PrismaPostgresAdapter } from '@prisma/adapter-ppg'

import {ENCRIPTION_FIELDS_EXTENSION} from './constants';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      errorFormat: 'minimal',
      adapter: new PrismaPostgresAdapter({
        connectionString: String(process.env.DATABASE_URL),
      }),
    });

    this.$extends(ENCRIPTION_FIELDS_EXTENSION)
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
