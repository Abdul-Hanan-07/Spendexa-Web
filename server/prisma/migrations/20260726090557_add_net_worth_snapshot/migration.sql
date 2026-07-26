-- CreateTable
CREATE TABLE "net_worth_snapshots" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "netWorth" DECIMAL(14,2) NOT NULL,
    "currentBalance" DECIMAL(14,2) NOT NULL,
    "totalAssets" DECIMAL(14,2) NOT NULL,
    "totalLoanDebt" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "net_worth_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "net_worth_snapshots_accountId_idx" ON "net_worth_snapshots"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "net_worth_snapshots_accountId_date_key" ON "net_worth_snapshots"("accountId", "date");

-- AddForeignKey
ALTER TABLE "net_worth_snapshots" ADD CONSTRAINT "net_worth_snapshots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
