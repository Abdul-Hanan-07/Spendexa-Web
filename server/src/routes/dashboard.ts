import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);

  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  const [loanDebtAgg, activeBudget, goalCount, recentTransactions] = await Promise.all([
    prisma.loan.aggregate({
      where: { accountId: account.id, status: 'ACTIVE' },
      _sum: { remainingAmount: true },
    }),
    prisma.budget.findFirst({
      where: { accountId: account.id, active: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.goal.count({ where: { accountId: account.id } }),
    prisma.transaction.findMany({
      where: { accountId: account.id },
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, amount: true, type: true, category: true, date: true },
    }),
  ]);

  const totalLoanDebt = loanDebtAgg._sum.remainingAmount ?? new Prisma.Decimal(0);
  const netWorth = account.currentBalance.plus(account.totalAssets).minus(totalLoanDebt);

  const activeBudgetPayload = activeBudget
    ? {
        id: activeBudget.id,
        name: activeBudget.name,
        startAmount: activeBudget.startAmount,
        remainingAmount: activeBudget.remainingAmount,
        spentAmount: activeBudget.spentAmount,
        isNearLimit: activeBudget.remainingAmount.lte(
          activeBudget.startAmount.times(new Prisma.Decimal(1).minus(activeBudget.alertThreshold)),
        ),
      }
    : null;

  return res.json({
    accountId: account.id,
    accountName: account.name,
    currentBalance: account.currentBalance,
    totalAssets: account.totalAssets,
    totalLoanDebt,
    netWorth,
    activeBudget: activeBudgetPayload,
    goalCount,
    recentTransactions,
  });
});

export default router;
