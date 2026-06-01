import { Injectable } from '@nestjs/common';
import { UserConfirmation } from '@prisma/client';
import { DatabaseService } from '../../core';
import { UserConfirmationCreateParams } from './params';

@Injectable()
export class UserConfirmationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getLastConfirmation(email: string): Promise<UserConfirmation | null> {
    const lastConfirmation = await this.databaseService.userConfirmation.findFirst({
      where: {
        email,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return lastConfirmation ?? null;
  }

  async create(params: UserConfirmationCreateParams): Promise<UserConfirmation> {
    const confirmation = await this.databaseService.userConfirmation.create({
      data: params,
    });

    return confirmation;
  }
}
