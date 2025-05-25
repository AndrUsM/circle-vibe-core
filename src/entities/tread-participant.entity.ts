import { z } from "zod";
import { createZodDto } from 'nestjs-zod';

export const ThreadParticipantSchema = z.object({
  id: z.number(),
  userId: z.number(),
  threadId: z.number(),
})

export class ThreadParticipant extends createZodDto(ThreadParticipantSchema) {}
