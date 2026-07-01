import { Prisma } from '@prisma/client';

interface ProgressInput {
  currentAmount: Prisma.Decimal;
  targetAmount: Prisma.Decimal;
}

export function computeGoalProgress(goal: ProgressInput): number {
  if (goal.targetAmount.isZero()) {
    return 0;
  }

  const progress = goal.currentAmount.div(goal.targetAmount).times(100);
  return Prisma.Decimal.min(progress, 100).toNumber();
}

export function buildGoalPayload<T extends ProgressInput>(goal: T) {
  return { ...goal, progress: computeGoalProgress(goal) };
}
