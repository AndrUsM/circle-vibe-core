import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatCreateInputDto, ChatMessagesPaginatedInputDto, ChatUpdateInputDto } from './dtos';
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

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

  @ApiResponse({
    status: 200,
    description: 'The chat has been successfully created',
  })
    @ApiBody({
    type: ChatCreateInputDto,
    description: 'Request body',
  })
  @HttpCode(201)
  createChat(@Body() params: ChatCreateInputDto) {
    return this.chatService.create(params);
  }
}
