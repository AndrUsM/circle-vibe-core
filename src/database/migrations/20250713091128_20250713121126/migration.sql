-- CreateTable
CREATE TABLE "ChatParticipantGatewayState" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChatParticipantGatewayState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipantGatewayState_clientId_key" ON "ChatParticipantGatewayState"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipantGatewayState_userId_key" ON "ChatParticipantGatewayState"("userId");
