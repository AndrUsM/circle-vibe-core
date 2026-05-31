import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core';
import { ChatsParticipantsWithUser, CreateChatParticipantInput } from './dtos';
import { ChatParticipant, UserChatRole } from '@prisma/client';
import { GetChatParticipantInput, ParticipantListParam } from './params';

@Injectable()
export class ParticipantRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createParticipantInputDto: CreateChatParticipantInput): Promise<ChatParticipant> {
    return this.databaseService.chatParticipant.create({
      data: createParticipantInputDto,
      include: {
        user: true,
      },
    });
  }

  async isExists({ chatId, chatRole }: { chatId: number; chatRole: UserChatRole }): Promise<boolean> {
    const count = await this.databaseService.chatParticipant.count({
      where: {
        chatId,
        chatRole,
      },
      select: {
        id: true,
      },
    });

    return Boolean(count);
  }

  async get(params: GetChatParticipantInput): Promise<ChatParticipant | null> {
    const participant = await this.databaseService.chatParticipant.findFirst({
      where: params,
      include: {
        user: true,
      },
    });

    return participant ?? null;
  }

  async getById(id: number): Promise<ChatParticipant | null> {
    return this.databaseService.chatParticipant.findUnique({
      where: { id },
    });
  }

  async listByAuthorizedUser(userId: number): Promise<ChatsParticipantsWithUser[]> {
    const chatIds = await this.databaseService.chatParticipant.findMany({
      distinct: 'chatId',
      where: {
        userId,
      },
      select: {
        chatId: true,
      },
    });
    const mappedIds = chatIds.map(({ chatId }) => chatId);

    return this.databaseService.chatParticipant.findMany({
      distinct: 'userId',
      select: {
        id: true,
        user: true,
      },
      where: {
        chatId: {
          in: mappedIds,
        },
      },
    }) as Promise<ChatsParticipantsWithUser[]>;
  }

  async list(params: ParticipantListParam): Promise<ChatParticipant[]> {
    const list = await this.databaseService.chatParticipant.findMany({
      where: {
        ...params,
      },
      include: {
        user: true,
      },
    });

    return list;
  }

  async getUserId(params: { participantId: number; chatId: number }): Promise<number | null> {
    const { participantId, chatId } = params ?? {};

    const response = await this.databaseService.chatParticipant.findFirst({
      where: {
        id: participantId,
        chatId,
      },
      select: {
        userId: true,
      },
    });

    return response?.userId ?? null;
  }

  async updatePartial(participantId: number, params: Partial<ChatParticipant>): Promise<ChatParticipant | null> {
    const chatParticipant = await this.databaseService.chatParticipant.findUnique({
      where: {
        id: participantId,
      },
    });

    return this.update(participantId, {
      ...chatParticipant,
      ...params,
    });
  }

  async update(participantId: number, params: Partial<ChatParticipant>): Promise<ChatParticipant | null> {
    return this.databaseService.chatParticipant.update({
      where: {
        id: participantId,
      },
      include: {
        user: true,
      },
      data: params,
    });
  }
}
