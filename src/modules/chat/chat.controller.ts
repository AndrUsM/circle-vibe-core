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
  ParseIntPipe,
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
import { UpdateChatParticipantInput } from '../participant/dtos';
import { MessageService } from '../message';
import { MessageUpdateInputDto } from '../message/dtos';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private participantService: ParticipantService,
    private userService: UserService,
    private messageService: MessageService,
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
  @UseGuards(JwtAuthGuard)
  async updateChat(
    @Param('id') chatId: number,
    @Body() params: ChatUpdateInputDto,
  ) {
    const chat = await this.chatService.findById(chatId);

    if (!chat) {
      throw new NotFoundException();
    }

    return this.chatService.update(chatId, params);
  }

  @Get('participants')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getChatsParticipants(@Query('userId', ParseIntPipe) userId: number) {
    if (!userId) {
      throw new BadRequestException();
    }

    return this.participantService.getChatsParticipantsByAuthorizedUser({
      userId
    })
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard)
  getChatParticipants(@Param('id') chatId: number) {
    if (!chatId) {
      return [];
    }

    return this.chatService.getChatParticipants(Number(chatId));
  }

  @Put(':id/message/:messageId')
  @UseGuards(JwtAuthGuard)
  async updateMessage(
    @Param('id') chatId: number,
    @Param('messageId') messageId: number,
    @Body() payload: MessageUpdateInputDto,
  ) {
    if (!chatId || !messageId) {
      throw new BadRequestException();
    }

    return this.messageService.updateMessage(
      Number(chatId),
      Number(messageId),
      payload,
    );
  }

  @Get(':id/message/:messageId')
  @UseGuards(JwtAuthGuard)
  async getMessageById(
    @Param('id') chatId: number,
    @Param('messageId') messageId: number,
  ) {
    if (!chatId || !messageId) {
      throw new BadRequestException();
    }

    return this.messageService.getMessageById(
      Number(messageId),
      Number(chatId),
    );
  }

  @Put(':id/participants/:participantId')
  @UseGuards(JwtAuthGuard)
  async updateChatParticipant(
    @Param('id') chatId: number,
    @Param('participantId') participantId: number,
    @Body() payload: UpdateChatParticipantInput,
  ) {
    if (!chatId || !participantId) {
      throw new BadRequestException();
    }

    return this.participantService.updateChatParticipant(
      Number(chatId),
      Number(participantId),
      payload,
    );
  }

  @Get(':id/user-to-invite')
  async getChatUsersToInvite(
    @Param('id') chatId: number,
    @Query('chatParticipantId') chatParticipantId: number,
    @Query('username') username: string,
    @Query('personalTargetUserToken') personalTargetUserToken?: string,
  ) {
    const hasQueryParams = username || personalTargetUserToken;
    if (!chatParticipantId || !chatId || !hasQueryParams) {
      throw new BadRequestException();
    }

    const user = await this.chatService.findUserForInvitation({
      chatParticipantId: Number(chatParticipantId),
      chatId: Number(chatId),
      username,
      personalTargetUserToken,
    });

    if (!user) {
      throw new NotFoundException();
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
      throw new UnauthorizedException();
    }

    return this.chatService.deleteChatMessage(
      Number(chatId),
      Number(messageId),
      Number(request?.userId),
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
  @Post(':id/invite')
  async createInviteLink(
    @Param('id') chatId: number,
    @Body() body: CreateInviteLinkBodyParams,
  ) {
    const targetUserId = body?.targetUserId;
    const fromChatParticipantId = body?.fromChatParticipantId;

    if (!chatId || !body?.targetUserId || !fromChatParticipantId) {
      throw new BadRequestException();
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
  @Get('accept-invite-token')
  async acceptInviteToken(@Query('token') token: string) {
    const tokenInformation = await this.chatService.validateInviteToken(token);
    const { isExpired, isValid, data } = tokenInformation;

    if (isExpired) {
      throw new BadRequestException('invite-token.is-expired');
    }

    if (!isValid || !data) {
      throw new BadRequestException('invite-token.invalid');
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
      throw new BadRequestException('invite-token.user-not-found');
    }

    if (fromChatParticipant?.chatRole !== UserChatRole.ADMIN) {
      throw new BadRequestException('invite-token.user-is-not-admin');
    }

    if (isJoined) {
      throw new BadRequestException('invite-token.already-joined');
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
