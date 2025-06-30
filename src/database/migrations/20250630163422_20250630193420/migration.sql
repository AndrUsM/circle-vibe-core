-- CreateTable
CREATE TABLE "ChatInvites" (
    "id" SERIAL NOT NULL,
    "fromChatParticipantId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "ChatInvites_pkey" PRIMARY KEY ("id")
);
