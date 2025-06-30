/*
  Warnings:

  - You are about to drop the `ChatInvites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ChatInvites";

-- CreateTable
CREATE TABLE "ChatInvite" (
    "id" SERIAL NOT NULL,
    "fromChatParticipantId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ChatInvite_pkey" PRIMARY KEY ("id")
);
