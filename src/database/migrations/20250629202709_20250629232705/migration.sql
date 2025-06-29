/*
  Warnings:

  - You are about to drop the column `isSavedMessages` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isSavedMessages" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isSavedMessages";
