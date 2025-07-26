import { Body, Controller, HttpCode, Post, Query } from '@nestjs/common';
import { ThreadCreateInputDto } from './dtos';
import { ThreadService } from './thread.service';

@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService){}

  @Post()
  @HttpCode(201)
  createThread(@Body() body: ThreadCreateInputDto) {
    return this.threadService.create(body);
  }
}
