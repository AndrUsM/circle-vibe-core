import { Test, TestingModule } from '@nestjs/testing';
import { ChatInviteService } from './chat-invite.service';

describe('ChatInvitesService', () => {
  let service: ChatInviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatInviteService],
    }).compile();

    service = module.get<ChatInviteService>(ChatInviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
