-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_threadId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_childThreadId_fkey" FOREIGN KEY ("childThreadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
