import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantRepository } from './participant.repository';

@Module({
  providers: [ParticipantService, ParticipantRepository],
})
export class ParticipantModule {}
