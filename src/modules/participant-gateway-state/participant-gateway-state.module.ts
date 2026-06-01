import { Module } from '@nestjs/common';
import { ParticipantGatewayStateService } from './participant-gateway-state.service';

@Module({
  providers: [ParticipantGatewayStateService],
  exports: [ParticipantGatewayStateService],
})
export class ParticipantGatewayStateModule {}
