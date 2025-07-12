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
      include: {
        user: true,
      },
    });
  }

  async getChatParticipants(params: GetChatParticipantInput): Promise<ChatParticipant | null> {
    return this.databaseService.chatParticipant.findFirst({
      where: params,
      include: {
        user: true,
      }
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

  async getChatParticipantById(
    chatParticipantId: number,
  ): Promise<ChatParticipant | null> {
    return this.databaseService.chatParticipant.findUnique({
      where: {
        id: chatParticipantId,
      },
    });
  }

  async getUserIdByChatParams(participantId: number, chatId: number): Promise<number | undefined> {
    const response = await this.databaseService.chatParticipant.findFirst({
      where: {
        id: participantId,
        chatId,
      },
      select: {
        userId: true,
      },
    });

    return response?.userId;
  }

  async createParticipantWithDefaultOptions(
    params: GetChatParticipantInput,
  ): Promise<ChatParticipant> {
    const chatParticipantExists = await this.databaseService.chatParticipant.findFirst({
      where: {
        chatId: params.chatId,
        chatRole: UserChatRole.ADMIN,
      },
    });

    const chatRole = chatParticipantExists ? UserChatRole.MEMBER : UserChatRole.ADMIN;

    return this.createChatParticipant({
      ...params,
      chatRole,
    });
  }
}
