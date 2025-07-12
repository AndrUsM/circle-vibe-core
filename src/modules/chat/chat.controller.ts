import { UserChatRole } from '@prisma/client';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Get,
  Query,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

import { ChatService } from './chat.service';
import { ChatCreateInputDto, ChatUpdateInputDto } from './dtos';
import { CreateInviteLinkBodyParams } from './params';
import { ParticipantService } from '../participant/participant.service';
import { UserService } from '../user';
import { ChatInviteService } from '../chat-invites';
import { HashedTokenParams } from '../auth/types';

import { JwtAuthGuard } from 'src/guards';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private participantService: ParticipantService,
    private userService: UserService,
    private chatInviteService: ChatInviteService,
  ) {}

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'The chat has been successfully updated',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the chat',
    required: true,
  })
  @ApiBody({
    type: ChatUpdateInputDto,
    description: 'Request body',
  })
  @HttpCode(200)
  updateChat(@Param('id') chatId: number, @Body() params: ChatUpdateInputDto) {
    const chat = this.chatService.findById(chatId);

    if (!chat) {
      return new NotFoundException();
    }

    return this.chatService.update(chatId, params);
  }

  @Get(':id/participants')
  getChatParticipants(@Param('id') chatId: number) {
    if (!chatId) {
      return [];
    }

    return this.chatService.getChatParticipants(Number(chatId));
  }

  @Get(':id/user-to-invite')
  getChatUsersToInvite(
    @Param('id') chatId: number,
    @Query('chatParticipantId') chatParticipantId: number,
    @Query('username') username: string,
    @Query("personalTargetUserToken") personalTargetUserToken?: string,
  ) {
    const hasQueryParams = username || personalTargetUserToken;
    if (!chatParticipantId || !chatId || !hasQueryParams) {
      return null;
    }

    const user =  this.chatService.findUserForInvitation({
      chatParticipantId: Number(chatParticipantId),
      chatId: Number(chatId),
      username,
      personalTargetUserToken,
    });

    if (!user) {
      return new NotFoundException();
    }

    return user;
  }

  @Delete(':id/message/:messageId')
  @UseGuards(JwtAuthGuard)
  deleteMessage(
    @Req() request: Request & HashedTokenParams,
    @Param('id') chatId: number,
    @Param('messageId') messageId: number,
  ) {
    if (!request?.userId) {
      return new UnauthorizedException();
    }

    return this.chatService.deleteChatMessage(
      chatId,
      messageId,
      request?.userId,
    );
  }

  @ApiResponse({
    status: 200,
    description: 'The chat has been successfully created',
  })
  @ApiBody({
    type: ChatCreateInputDto,
    description: 'Request body',
  })
  @Post()
  @HttpCode(201)
  createChat(@Body() params: ChatCreateInputDto) {
    return this.chatService.create(params);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteChat(@Param('id') chatId: number) {
    return this.chatService.delete(chatId);
  }

  @ApiResponse({
    status: 200,
    description: 'Link for invite has been successfully created',
  })
  @HttpCode(201)
  @Post(':id/invite')
  async createInviteLink(
    @Param('id') chatId: number,
    @Body() body: CreateInviteLinkBodyParams,
  ) {
    const targetUserId = body?.targetUserId;
    const fromChatParticipantId = body?.fromChatParticipantId;

    if (!chatId || !body?.targetUserId || !fromChatParticipantId) {
      return new BadRequestException();
    }

    const { token, expirationDate } =
      await this.chatService.generateInviteToken(
        Number(chatId),
        Number(targetUserId),
        Number(fromChatParticipantId),
      );

    await this.chatInviteService.create({
      chatId: Number(chatId),
      targetUserId: Number(targetUserId),
      role: UserChatRole.MEMBER,
      fromChatParticipantId: Number(fromChatParticipantId),
      token,
      expirationDate,
    });

    return token;
  }

  @ApiResponse({
    status: 200,
    description: 'User has been joined to the chat',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the chat',
    required: true,
  })
  @HttpCode(200)
  @Get('accept-invite-token')
  async acceptInviteToken(@Query('token') token: string) {
    const tokenInformation = await this.chatService.validateInviteToken(token);
    const { isExpired, isValid, data } = tokenInformation;

    if (isExpired) {
      return new BadRequestException('invite-token.is-expired');
    }

    if (!isValid || !data) {
      return new BadRequestException('invite-token.invalid');
    }

    const isJoined = await this.chatService.isChatParticipantExist(
      data.chatId,
      data.targetUserId,
    );
    const targetUser = await this.userService.getById(data.targetUserId);
    const fromChatParticipant =
      await this.participantService.getChatParticipantById(
        data.fromChatParticipantId,
      );

    if (!targetUser) {
      return new BadRequestException('invite-token.user-not-found');
    }

    if (fromChatParticipant?.chatRole !== UserChatRole.ADMIN) {
      return new BadRequestException('invite-token.user-is-not-admin');
    }

    if (isJoined) {
      return new BadRequestException('invite-token.already-joined');
    }

    const chatParticipant = await this.participantService.createChatParticipant(
      {
        chatId: data.chatId,
        userId: data.targetUserId,
        chatRole: data.role ?? UserChatRole.MEMBER,
      },
    );
    const chat = await this.chatService.getById(data.chatId);

    await this.chatInviteService.deleteByToken(token);
    await this.chatInviteService.clearAllInvitationsForUser(
      data.targetUserId,
      data.chatId,
    );

    return {
      chatParticipant,
      chat,
    };
  }
}
