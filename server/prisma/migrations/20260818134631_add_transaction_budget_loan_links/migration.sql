-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "budgetId" TEXT,
ADD COLUMN     "loanId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_budgetId_idx" ON "transactions"("budgetId");

-- CreateIndex
CREATE INDEX "transactions_loanId_idx" ON "transactions"("loanId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
