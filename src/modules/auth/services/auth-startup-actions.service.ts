import { Injectable } from '@nestjs/common';
import { ChatType } from '@circle-vibe/shared';

import { ChatService } from 'src/modules/chat';
import { ParticipantService } from 'src/modules/participant';

@Injectable()
export class AuthStartUpService {
  constructor(
    private chatService: ChatService,
    private participantService: ParticipantService,
  ) {}

  async createDefaultPrivateSettings(userId: number): Promise<void> {
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

    if (chat) {
      await this.participantService.createParticipantWithDefaultOptions({
        userId,
        chatId: chat.id,
      });
    }
  }
}
