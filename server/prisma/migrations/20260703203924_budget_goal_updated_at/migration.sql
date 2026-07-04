-- AlterTable: backfill existing rows via a temporary default, then drop it so
-- Prisma's @updatedAt client-side behavior takes over for future writes.
ALTER TABLE "budgets" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "budgets" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "goals" ALTER COLUMN "updatedAt" DROP DEFAULT;
