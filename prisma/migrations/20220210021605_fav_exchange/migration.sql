-- CreateTable
CREATE TABLE "favExchange" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "exchangeId" INTEGER NOT NULL,

    CONSTRAINT "favExchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favExchange_userId_exchangeId_key" ON "favExchange"("userId", "exchangeId");

-- AddForeignKey
ALTER TABLE "favExchange" ADD CONSTRAINT "favExchange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
