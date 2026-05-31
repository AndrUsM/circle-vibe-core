import { Injectable } from '@nestjs/common';
import { ChatParticipant, UserChatRole } from '@prisma/client';
import { ChatsParticipantsWithUserParam, GetChatParticipantInput, ParticipantListParam } from './params';
import { ChatsParticipantsWithUser, CreateChatParticipantInput, UpdateChatParticipantInput } from './dtos';
import { ParticipantRepository } from './participant.repository';

@Injectable()
export class ParticipantService {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  create(createParticipantInputDto: CreateChatParticipantInput): Promise<ChatParticipant> {
    return this.participantRepository.create(createParticipantInputDto);
  }

  async getChatsParticipantsByAuthorizedUser({ userId }: ChatsParticipantsWithUserParam): Promise<ChatsParticipantsWithUser[]> {
    return this.participantRepository.listByAuthorizedUser(userId);
  }

  async list(params: ParticipantListParam): Promise<ChatParticipant[]> {
    return this.participantRepository.list(params);
  }

  async getChatParticipant(params: GetChatParticipantInput): Promise<ChatParticipant | null> {
    return this.participantRepository.get(params);
  }

  async updateChatParticipant(participantId: number, params: UpdateChatParticipantInput) {
    return this.participantRepository.updatePartial(participantId, params);
  }

  async getOrCreateChatParticipant(params: GetChatParticipantInput): Promise<ChatParticipant | null> {
    const participant = await this.participantRepository.get(params);

    if (participant) {
      return participant;
    }

    return this.createParticipantWithDefaultOptions(params);
  }

  async getChatParticipantById(chatParticipantId: number): Promise<ChatParticipant | null> {
    return this.participantRepository.getById(chatParticipantId);
  }

  async getUserIdByChatParams(participantId: number, chatId: number): Promise<number | null> {
    return this.participantRepository.getUserId({ participantId, chatId });
  }

  async createParticipantWithDefaultOptions(params: GetChatParticipantInput): Promise<ChatParticipant> {
    const chatParticipantExists = await this.participantRepository.isExists({
      chatId: params.chatId,
      chatRole: UserChatRole.ADMIN,
    });

    const chatRole = chatParticipantExists ? UserChatRole.MEMBER : UserChatRole.ADMIN;

    return this.participantRepository.create({
      ...params,
      chatRole,
    });
  }
}
