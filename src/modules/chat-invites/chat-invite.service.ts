import { Injectable } from '@nestjs/common';
import { ChatInvite } from '@prisma/client';

import { DatabaseService } from 'src/core';
import { CreateChatInviteInputDto } from './dtos';

@Injectable()
export class ChatInviteService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(params: CreateChatInviteInputDto): Promise<ChatInvite> {
    return this.databaseService.chatInvite.create({
      data: params,
    });
  }

  delete(chatInviteId: number) {
    return this.databaseService.chatInvite.delete({
      where: {
        id: chatInviteId,
      },
    });
  }

  deleteByToken(token: string) {
    return this.databaseService.chatInvite.delete({
      where: {
        token,
      },
    });
  }
  clearAllInvitationsForUser(targetUser: number, chatId: number) {
    return this.databaseService.chatInvite.deleteMany({
      where: {
        targetUserId: targetUser,
        chatId,
      },
    });
  }

  getByToken(token: string) {
    return this.databaseService.chatInvite.findUnique({
      where: {
        token,
      },
    });
  }
}
