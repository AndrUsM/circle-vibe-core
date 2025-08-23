import { Prisma } from '@prisma/client';

export const SENSITIVE_FIELDS_MAP: Partial<Record<Prisma.ModelName, string[]>> = {
  User: ['email', 'primaryPhone', 'birthDate', 'country', 'city'],
  Message: ['content', 'chatId', 'senderId', 'threadId'],
  Thread: ['chatId'],
  Chat: ['readableName', 'name', 'description', 'isSavedMessages', 'hidden', 'type'],
  ChatParticipant: ['chatRole', 'userId', 'chatId'],
  ChatInvite: ['fromChatParticipantId', 'targetUserId', 'expirationDate'],
  ChatParticipantGatewayState: ['clientId', 'userId'],
  UserConfirmation: ['userId', 'email', 'code', 'confirmed'],
};
