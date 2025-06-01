-- CreateEnum
CREATE TYPE "UserChatStatus" AS ENUM ('ONLINE', 'BUSY', 'AT_WORK', 'OFFLINE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatStatus" "UserChatStatus" DEFAULT 'OFFLINE';
