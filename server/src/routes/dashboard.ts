import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDefaultAccount } from '../lib/account';
import { isBudgetNearLimit } from '../lib/budget';
import { requireAuth } from '../middleware/auth';

const router = Router();

function utcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function percentChange(change: Prisma.Decimal, base: Prisma.Decimal): number | null {
  if (base.isZero()) return null;
  return change.dividedBy(base.abs()).times(100).toNumber();
}

const DASHBOARD_QUERY_TIMEOUT_MS = 4000;

class DashboardTimeoutError extends Error {
  constructor() {
    super('Dashboard query timed out');
    this.name = 'DashboardTimeoutError';
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new DashboardTimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function fetchDashboardData(account: { id: string; currentBalance: Prisma.Decimal; totalAssets: Prisma.Decimal }) {
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

  const today = utcDateOnly(new Date());
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const snapshotData = {
    netWorth,
    currentBalance: account.currentBalance,
    totalAssets: account.totalAssets,
    totalLoanDebt,
  };

  const [, yesterdaySnapshot] = await Promise.all([
    prisma.netWorthSnapshot.upsert({
      where: { accountId_date: { accountId: account.id, date: today } },
      create: { accountId: account.id, date: today, ...snapshotData },
      update: snapshotData,
    }),
    prisma.netWorthSnapshot.findUnique({
      where: { accountId_date: { accountId: account.id, date: yesterday } },
    }),
  ]);

  let netWorthChange: Prisma.Decimal | null = null;
  let netWorthChangePercent: number | null = null;
  let investmentChange: Prisma.Decimal | null = null;
  let investmentChangePercent: number | null = null;

  if (yesterdaySnapshot) {
    netWorthChange = netWorth.minus(yesterdaySnapshot.netWorth);
    netWorthChangePercent = percentChange(netWorthChange, yesterdaySnapshot.netWorth);

    investmentChange = account.totalAssets.minus(yesterdaySnapshot.totalAssets);
    investmentChangePercent = percentChange(investmentChange, yesterdaySnapshot.totalAssets);
  }

  const activeBudgetPayload = activeBudget
    ? {
        id: activeBudget.id,
        name: activeBudget.name,
        startAmount: activeBudget.startAmount,
        remainingAmount: activeBudget.remainingAmount,
        spentAmount: activeBudget.spentAmount,
        isNearLimit: isBudgetNearLimit(activeBudget),
      }
    : null;

  return {
    totalLoanDebt,
    netWorth,
    netWorthChange,
    netWorthChangePercent,
    investmentChange,
    investmentChangePercent,
    activeBudget: activeBudgetPayload,
    goalCount,
    recentTransactions,
  };
}

router.get('/', requireAuth, async (req, res) => {
  const account = await getDefaultAccount(req.userId!);

  if (!account) {
    return res.status(404).json({ error: 'No account found' });
  }

  let data;
  try {
    data = await withTimeout(fetchDashboardData(account), DASHBOARD_QUERY_TIMEOUT_MS);
  } catch (err) {
    if (!(err instanceof DashboardTimeoutError)) {
      throw err;
    }
    console.warn(`Dashboard query exceeded ${DASHBOARD_QUERY_TIMEOUT_MS}ms, retrying once for account ${account.id}`);
    try {
      data = await withTimeout(fetchDashboardData(account), DASHBOARD_QUERY_TIMEOUT_MS);
    } catch (retryErr) {
      if (retryErr instanceof DashboardTimeoutError) {
        return res.status(503).json({
          error: 'Dashboard is taking longer than usual to load. Please try again in a moment.',
        });
      }
      throw retryErr;
    }
  }

  return res.json({
    accountId: account.id,
    accountName: account.name,
    currentBalance: account.currentBalance,
    totalAssets: account.totalAssets,
    ...data,
  });
});

export default router;
