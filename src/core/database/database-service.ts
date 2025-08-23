import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient,  } from '@prisma/client';

import {ENCRIPTION_FIELDS_EXTENSION} from './constants';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      errorFormat: 'minimal',
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
