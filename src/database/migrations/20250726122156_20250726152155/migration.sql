/*
  Warnings:

  - You are about to drop the `ThreadParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ThreadParticipant" DROP CONSTRAINT "ThreadParticipant_chatParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "ThreadParticipant" DROP CONSTRAINT "ThreadParticipant_threadId_fkey";

-- DropTable
DROP TABLE "ThreadParticipant";

-- CreateTable
CREATE TABLE "_ChatParticipantToThread" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChatParticipantToThread_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChatParticipantToThread_B_index" ON "_ChatParticipantToThread"("B");

-- AddForeignKey
ALTER TABLE "_ChatParticipantToThread" ADD CONSTRAINT "_ChatParticipantToThread_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatParticipantToThread" ADD CONSTRAINT "_ChatParticipantToThread_B_fkey" FOREIGN KEY ("B") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
