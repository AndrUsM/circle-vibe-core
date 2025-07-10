/*
  Warnings:

  - Added the required column `role` to the `ChatInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatInvite" ADD COLUMN     "role" "UserChatRole" NOT NULL;
