import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ChatParticipantGatewayStateSchema = z.object({
  id: z.number(),
  clientId: z.string(),
  userId: z.number(),
});

export class ChatParticipantGatewayState extends createZodDto(ChatParticipantGatewayStateSchema) {}
