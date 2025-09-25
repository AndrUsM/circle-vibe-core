/*
  Warnings:

  - The values [MP3_AUDIO] on the enum `MessageFileType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hidden` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageFileType_new" AS ENUM ('MP4', 'OGG', 'WEBM', 'AVI', 'IMAGE', 'AUDIO', 'DOCUMENT', 'MS_DOCUMENT');
ALTER TABLE "MessageFile" ALTER COLUMN "type" TYPE "MessageFileType_new" USING ("type"::text::"MessageFileType_new");
ALTER TYPE "MessageFileType" RENAME TO "MessageFileType_old";
ALTER TYPE "MessageFileType_new" RENAME TO "MessageFileType";
DROP TYPE "MessageFileType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "hidden",
ALTER COLUMN "type" SET DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";
