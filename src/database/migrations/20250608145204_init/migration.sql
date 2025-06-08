-- CreateEnum
CREATE TYPE "MessageFileEntityType" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- CreateEnum
CREATE TYPE "MessageFileType" AS ENUM ('MP4', 'OGG', 'WEBM', 'AVI', 'DOCUMENT', 'MS_DOCUMENT');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserChatRole" AS ENUM ('ADMIN', 'MODERATOR', 'BOT', 'MEMBER', 'TECH_SUPPORT');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('VIEWED', 'UNREAD', 'NOT_SENT', 'DRAFT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE');

-- CreateEnum
CREATE TYPE "UserChatStatus" AS ENUM ('ONLINE', 'BUSY', 'AT_WORK', 'OFFLINE');

-- CreateTable
CREATE TABLE "MessageFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MessageFileType" NOT NULL,
    "description" TEXT,
    "entityType" "MessageFileEntityType" NOT NULL DEFAULT 'FILE',
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "MessageFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isHiddenContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "country" TEXT,
    "city" TEXT,
    "email" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateToken" TEXT NOT NULL,
    "primaryPhone" TEXT,
    "type" "UserType" NOT NULL DEFAULT 'PRIVATE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "chatStatus" "UserChatStatus" NOT NULL DEFAULT 'OFFLINE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "threadId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadParticipant" (
    "id" SERIAL NOT NULL,
    "chatParticipantId" INTEGER NOT NULL,
    "threadId" INTEGER NOT NULL,

    CONSTRAINT "ThreadParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "avatarUrl" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "readableName" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChatType" NOT NULL DEFAULT 'PUBLIC',
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "hasUnreadMessages" BOOLEAN DEFAULT false,
    "empty" BOOLEAN DEFAULT true,
    "unreadMessagesCount" INTEGER NOT NULL DEFAULT 0,
    "usersLimit" INTEGER NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageId" INTEGER,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "chatRole" "UserChatRole" NOT NULL DEFAULT 'ADMIN',
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageToMessageFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MessageToMessageFile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_privateKey_key" ON "User"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_privateToken_key" ON "User"("privateToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryPhone_key" ON "User"("primaryPhone");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadParticipant_chatParticipantId_threadId_key" ON "ThreadParticipant"("chatParticipantId", "threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_name_key" ON "Chat"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_readableName_key" ON "Chat"("readableName");

-- CreateIndex
CREATE INDEX "_MessageToMessageFile_B_index" ON "_MessageToMessageFile"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_chatParticipantId_fkey" FOREIGN KEY ("chatParticipantId") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadParticipant" ADD CONSTRAINT "ThreadParticipant_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToMessageFile" ADD CONSTRAINT "_MessageToMessageFile_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToMessageFile" ADD CONSTRAINT "_MessageToMessageFile_B_fkey" FOREIGN KEY ("B") REFERENCES "MessageFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
