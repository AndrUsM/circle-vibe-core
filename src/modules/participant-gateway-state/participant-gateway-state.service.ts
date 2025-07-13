import { Injectable } from '@nestjs/common';
import { ChatParticipantGatewayState } from '@prisma/client';

import { DatabaseService } from 'src/core';
import {
  ParticipantGatewayCreateInputDto,
  ParticipantGatewayDeleteInputDto,
} from './dtos';

@Injectable()
export class ParticipantGatewayStateService {
  constructor(private databaseService: DatabaseService) {}

  async create(params: ParticipantGatewayCreateInputDto) {
    const existingState = await this.getByClientId(params.clientId);

    if (!existingState) {
      await this.databaseService.chatParticipantGatewayState.create({
        data: params,
      });

      return;
    }

    await this.databaseService.chatParticipantGatewayState.update({
      where: {
        clientId: params.clientId,
      },
      data: {
        userId: params.userId,
      },
    });
  }

  async delete(params: ParticipantGatewayDeleteInputDto) {

    return this.databaseService.$executeRawUnsafe(
      `DELETE FROM "ChatParticipantGatewayState" WHERE "clientId" = '${params.clientId}'`,
    )
  }

  async deleteByUserId(userId: number) {
    return this.databaseService.$executeRawUnsafe(
      `DELETE FROM "ChatParticipantGatewayState" WHERE "userId" = ${userId}`,
    );
  }

  async getByClientId(
    clientId: string,
  ): Promise<ChatParticipantGatewayState | null> {
    return this.databaseService.chatParticipantGatewayState.findFirst({
      where: {
        clientId,
      },
    });
  }

  async getByUserId(
    userId: number,
  ): Promise<ChatParticipantGatewayState | null> {
    return this.databaseService.chatParticipantGatewayState.findFirst({
      where: {
        userId,
      },
    });
  }
}
