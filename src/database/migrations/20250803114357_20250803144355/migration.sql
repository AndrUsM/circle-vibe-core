-- CreateTable
CREATE TABLE "UserConfirmation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "UserConfirmation_pkey" PRIMARY KEY ("id")
);
