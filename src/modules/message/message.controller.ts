import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

import { MessageCreateInputDto, MessagesPaginatedInputDto } from './dtos';
import { MessageService } from './message.service';
import { ChatService } from '../chat/chat.service';

@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private chatService: ChatService,
  ) {}

  @Post()
  @HttpCode(201)
  async createMessage(@Body() params: MessageCreateInputDto) {
    return this.messageService.create(params);
  }

  @Get('messages-paginated')
  @ApiResponse({
    status: 200,
  })
  @ApiQuery({
    default: {
      cursor: 'number',
      limit: 'number',
      chartId: 'number',
    },
    description: 'Query parameters',
  })
  @HttpCode(200)
  async chatMessagesPaginated(
    @Query('chatId') chatId: number,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    const chat = await this.chatService.findById(chatId);

    if (chat === null) {
      throw new NotFoundException();
    }

    const params: MessagesPaginatedInputDto = {
      page,
      pageSize,
    };

    return this.messageService.getMessagesByChatPaginated(chatId, params);
  }
}
