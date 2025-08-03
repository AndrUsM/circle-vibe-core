-- AlterEnum
ALTER TYPE "MessageFileEntityType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "UserConfirmation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
