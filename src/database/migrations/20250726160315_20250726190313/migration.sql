/*
  Warnings:

  - You are about to drop the column `childTreadId` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "childTreadId",
ADD COLUMN     "childThreadId" INTEGER;
