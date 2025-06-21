import { Injectable } from '@nestjs/common';
import { ChatParticipant, UserChatRole } from '@prisma/client';
import { DatabaseService } from 'src/core';
import { GetChatParticipantInput } from './params';
import { CreateChatParticipantInput } from './dtos';

@Injectable()
export class ParticipantService {
  constructor(private readonly databaseService: DatabaseService) {}

  createChatParticipant(
    createParticipantInputDto: CreateChatParticipantInput,
  ): Promise<ChatParticipant> {
    return this.databaseService.chatParticipant.create({
      data: createParticipantInputDto,
    });
  }

  async getOrCreateChatParticipant(
    params: GetChatParticipantInput,
  ): Promise<ChatParticipant | null> {
    const participant = await this.databaseService.chatParticipant.findFirst({
      where: params,
    });

    if (participant) {
      return participant;
    }

    return this.createParticipantWithDefaultOptions(params);
  }

  async createParticipantWithDefaultOptions(
    params: GetChatParticipantInput,
  ): Promise<ChatParticipant> {
    const chat = await this.databaseService.chatParticipant.findFirst({
      where: {
        chatId: params.chatId,
        chatRole: UserChatRole.ADMIN,
      },
    });

    const chatRole = chat? UserChatRole.MEMBER : UserChatRole.ADMIN;

    return this.createChatParticipant({
      ...params,
      chatRole,
    });
  }
}
