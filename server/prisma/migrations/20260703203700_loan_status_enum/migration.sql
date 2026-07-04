-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID_OFF');

-- AlterTable: convert loans.status from text to the LoanStatus enum, preserving data
ALTER TABLE "loans" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "loans" ALTER COLUMN "status" TYPE "LoanStatus" USING ("status"::"LoanStatus");
ALTER TABLE "loans" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
