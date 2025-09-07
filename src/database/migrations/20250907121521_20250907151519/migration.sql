-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blockedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
