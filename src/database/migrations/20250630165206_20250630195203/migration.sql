/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `ChatInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatInvite_token_key" ON "ChatInvite"("token");
