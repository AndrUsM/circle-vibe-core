import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantGatewayStateService } from './participant-gateway-state.service';

describe('ParticipantGatewayStateService', () => {
  let service: ParticipantGatewayStateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantGatewayStateService],
    }).compile();

    service = module.get<ParticipantGatewayStateService>(ParticipantGatewayStateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
