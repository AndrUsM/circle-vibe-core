import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core';
import { ThreadCreateInputDto } from './dtos';

@Injectable()
export class ThreadService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(params: ThreadCreateInputDto) {
    const thread = await this.databaseService.thread.create({
      data: params,
    });

    await this.databaseService.message.update({
      where: {
        id: params.parentMessageId,
      },
      data: {
        childThreadId: thread.id,
      },
    });

    return thread;
  }

  async getOrCreate(params: ThreadCreateInputDto, threadId?: number) {
    const thread = await this.databaseService.thread.findFirst({
      where: {
        id: threadId,
      },
    });

    if (thread) {
      return thread;
    }

    return this.create(params);
  }

  async delete(id: number) {
    return this.databaseService.thread.delete({
      where: {
        id,
      },
    });
  }
}
