import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';

@Module({
  providers: [ParticipantService]
})
export class ParticipantModule {}
