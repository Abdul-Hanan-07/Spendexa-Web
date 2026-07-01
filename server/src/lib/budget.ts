import { Prisma } from '@prisma/client';

interface NearLimitInput {
  remainingAmount: Prisma.Decimal;
  startAmount: Prisma.Decimal;
  alertThreshold: Prisma.Decimal;
}

export function isBudgetNearLimit(budget: NearLimitInput): boolean {
  return budget.remainingAmount.lte(
    budget.startAmount.times(new Prisma.Decimal(1).minus(budget.alertThreshold)),
  );
}

interface PeriodInput {
  startDate: Date;
  endDate: Date;
}

export function isBudgetWithinPeriod(budget: PeriodInput, referenceDate: Date = new Date()): boolean {
  return referenceDate >= budget.startDate && referenceDate <= budget.endDate;
}

type BudgetPayloadInput = NearLimitInput &
  PeriodInput & { id: string; name: string; spentAmount: Prisma.Decimal };

export function buildBudgetPayload(budget: BudgetPayloadInput) {
  return {
    id: budget.id,
    name: budget.name,
    startAmount: budget.startAmount,
    remainingAmount: budget.remainingAmount,
    spentAmount: budget.spentAmount,
    isNearLimit: isBudgetNearLimit(budget),
    isWithinPeriod: isBudgetWithinPeriod(budget),
  };
}
