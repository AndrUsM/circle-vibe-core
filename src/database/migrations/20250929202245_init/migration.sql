-- CreateEnum
CREATE TYPE "MessageFileEntityType" AS ENUM ('IMAGE', 'VIDEO', 'FILE', 'AUDIO');

-- CreateEnum
CREATE TYPE "MessageFileType" AS ENUM ('MP4', 'OGG', 'WEBM', 'AVI', 'IMAGE', 'AUDIO', 'DOCUMENT', 'MS_DOCUMENT');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "UserChatRole" AS ENUM ('ADMIN', 'MODERATOR', 'BOT', 'MEMBER', 'TECH_SUPPORT');

-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('VIEWED', 'UNREAD', 'NOT_SENT', 'DRAFT');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO');

-- CreateEnum
CREATE TYPE "UserChatStatus" AS ENUM ('ONLINE', 'BUSY', 'AT_WORK', 'OFFLINE');

-- CreateTable
CREATE TABLE "MessageFile" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "optimizedUrl" TEXT NOT NULL,
    "type" "MessageFileType" NOT NULL,
    "description" TEXT,
    "entityType" "MessageFileEntityType" NOT NULL DEFAULT 'FILE',
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "MessageFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "username" TEXT,
    "birthDate" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "avatarUrlOptimized" TEXT,
    "isHiddenContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "isAllowedToSearch" BOOLEAN DEFAULT true,
    "country" TEXT,
    "city" TEXT,
    "email" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateToken" TEXT NOT NULL,
    "primaryPhone" TEXT,
    "type" "UserType" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "chatStatus" "UserChatStatus" NOT NULL DEFAULT 'OFFLINE',
    "blockedUserIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

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
    "childThreadId" INTEGER,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "threadId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "parentMessageId" INTEGER NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bucket" TEXT NOT NULL DEFAULT 'conversations',
    "name" TEXT NOT NULL,
    "readableName" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChatType" NOT NULL DEFAULT 'PRIVATE',
    "isGroupChat" BOOLEAN NOT NULL DEFAULT false,
    "isSavedMessages" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "hasUnreadMessages" BOOLEAN DEFAULT false,
    "empty" BOOLEAN DEFAULT true,
    "unreadMessagesCount" INTEGER NOT NULL DEFAULT 0,
    "usersLimit" INTEGER NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "encryptionSecret" TEXT DEFAULT 'Se9XNjAcmbrNoCooRPJq',
    "lastMessageId" INTEGER,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "chatRole" "UserChatRole" NOT NULL DEFAULT 'ADMIN',
    "isMuted" BOOLEAN DEFAULT false,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatInvite" (
    "id" SERIAL NOT NULL,
    "fromChatParticipantId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "role" "UserChatRole" NOT NULL,
    "token" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "ChatInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatParticipantGatewayState" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChatParticipantGatewayState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfirmation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageToMessageFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MessageToMessageFile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChatParticipantToThread" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChatParticipantToThread_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

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
CREATE UNIQUE INDEX "Chat_readableName_key" ON "Chat"("readableName");

-- CreateIndex
CREATE UNIQUE INDEX "ChatInvite_token_key" ON "ChatInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipantGatewayState_clientId_key" ON "ChatParticipantGatewayState"("clientId");

-- CreateIndex
CREATE INDEX "_MessageToMessageFile_B_index" ON "_MessageToMessageFile"("B");

-- CreateIndex
CREATE INDEX "_ChatParticipantToThread_B_index" ON "_ChatParticipantToThread"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToMessageFile" ADD CONSTRAINT "_MessageToMessageFile_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToMessageFile" ADD CONSTRAINT "_MessageToMessageFile_B_fkey" FOREIGN KEY ("B") REFERENCES "MessageFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatParticipantToThread" ADD CONSTRAINT "_ChatParticipantToThread_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatParticipantToThread" ADD CONSTRAINT "_ChatParticipantToThread_B_fkey" FOREIGN KEY ("B") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
