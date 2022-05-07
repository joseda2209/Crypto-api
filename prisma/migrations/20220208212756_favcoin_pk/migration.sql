/*
  Warnings:

  - A unique constraint covering the columns `[userId,coinId]` on the table `favCoin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "favCoin_userId_coinId_key" ON "favCoin"("userId", "coinId");
