import { z } from "zod";
import { createZodDto } from 'nestjs-zod';
import { MessageSchema } from "./message.entity";
import { ThreadParticipantSchema } from "./tread-participant.entity";

export const ThreadSchema = z.object({
  id: z.number(),
  messages: z.array(MessageSchema),
  participants: z.array(ThreadParticipantSchema),
})

export class Thread extends createZodDto(ThreadSchema) {}
