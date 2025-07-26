-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_childThreadId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
