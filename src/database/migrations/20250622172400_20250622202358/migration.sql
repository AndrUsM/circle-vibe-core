/*
  Warnings:

  - Added the required column `optimizedUrl` to the `MessageFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MessageFileType" ADD VALUE 'IMAGE';

-- AlterTable
ALTER TABLE "MessageFile" ADD COLUMN     "optimizedUrl" TEXT NOT NULL;
