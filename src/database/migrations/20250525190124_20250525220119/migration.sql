/*
  Warnings:

  - You are about to drop the column `userId` on the `ThreadParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `chatRole` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatParticipantId,threadId]` on the table `ThreadParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatId` to the `Thread` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatParticipantId` to the `ThreadParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "ThreadParticipant" DROP CONSTRAINT "ThreadParticipant_userId_fkey";

-- DropIndex
DROP INDEX "ThreadParticipant_userId_threadId_key";

-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "chatId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ThreadParticipant" DROP COLUMN "userId",
ADD COLUMN     "chatParticipantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "chatRole";

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "chatRole" "UserChatRole" NOT NULL DEFAULT 'ADMIN',
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreadParticipant_chatParticipantId_threadId_key" ON "ThreadParticipant"("chatParticipantId", "threadId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_chatParticipantId_fkey" FOREIGN KEY ("chatParticipantId") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
