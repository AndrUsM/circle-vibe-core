import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatType } from '@circle-vibe/shared';

import { ChatService } from 'src/modules/chat';
import { ParticipantService } from 'src/modules/participant';
import { ChatParticipant } from '@prisma/client';

@Injectable()
export class AuthStartUpService {
  constructor(
    private chatService: ChatService,
    private participantService: ParticipantService,
  ) {}

  async createDefaultPrivateSettings(userId: number): Promise<ChatParticipant> {
    const chat = await this.chatService.create(
      {
        name: 'saved-messages',
        description: 'description',
        type: ChatType.PRIVATE,
        usersLimit: 1,
      },
      {
        isSavedMessages: true,
      },
    );

    if (!chat) {
      return Promise.reject(new BadRequestException('Cannot create chat'));
    }

    return this.participantService.createParticipantWithDefaultOptions({
      userId,
      chatId: chat.id,
    });
  }
}
