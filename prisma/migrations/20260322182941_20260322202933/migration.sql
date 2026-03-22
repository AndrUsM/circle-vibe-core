/*
  Warnings:

  - You are about to drop the column `isDeactivated` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('DEACTIVATED', 'LOCKED', 'ACTIVE', 'NOT_ACTIVE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isDeactivated",
ADD COLUMN     "accountStatus" "AccountStatus" DEFAULT 'ACTIVE';
