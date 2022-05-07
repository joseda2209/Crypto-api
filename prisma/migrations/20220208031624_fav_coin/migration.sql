-- CreateTable
CREATE TABLE "favCoin" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "coinId" INTEGER NOT NULL,

    CONSTRAINT "favCoin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "favCoin" ADD CONSTRAINT "favCoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
