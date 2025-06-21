/*
  Warnings:

  - A unique constraint covering the columns `[readableName]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_readableName_key" ON "Chat"("readableName");
