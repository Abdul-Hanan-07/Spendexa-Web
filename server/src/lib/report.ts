import { Prisma, type Account } from '@prisma/client';
import { prisma } from './prisma';
import { buildBudgetPayload } from './budget';
import { buildGoalPayload } from './goal';

export interface ReportRange {
  startDate?: Date;
  endDate?: Date;
}

export async function getReportData(userId: string, account: Account, range: ReportRange) {
  const dateFilter =
    range.startDate || range.endDate
      ? {
          ...(range.startDate ? { gte: range.startDate } : {}),
          ...(range.endDate ? { lte: range.endDate } : {}),
        }
      : undefined;

  const [user, transactions, investments, loans, budgets, goals, loanDebtAgg, incomeAgg, expenseAgg] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({
        where: { accountId: account.id, ...(dateFilter ? { date: dateFilter } : {}) },
        orderBy: { date: 'desc' },
      }),
      prisma.investment.findMany({ where: { accountId: account.id }, orderBy: { purchaseDate: 'desc' } }),
      prisma.loan.findMany({
        where: { accountId: account.id },
        include: { repayments: { orderBy: { date: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.budget.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' } }),
      prisma.goal.findMany({ where: { accountId: account.id }, orderBy: { deadline: 'asc' } }),
      prisma.loan.aggregate({ where: { accountId: account.id, status: 'ACTIVE' }, _sum: { remainingAmount: true } }),
      prisma.transaction.aggregate({
        where: { accountId: account.id, type: 'INCOME', ...(dateFilter ? { date: dateFilter } : {}) },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { accountId: account.id, type: 'EXPENSE', ...(dateFilter ? { date: dateFilter } : {}) },
        _sum: { amount: true },
      }),
    ]);

  if (!user) {
    throw new Error('User not found for report generation');
  }

  const totalLoanDebt = loanDebtAgg._sum.remainingAmount ?? new Prisma.Decimal(0);
  const netWorth = account.currentBalance.plus(account.totalAssets).minus(totalLoanDebt);
  const investmentPortfolioValue = investments.reduce(
    (sum, inv) => sum.plus(inv.currentValue),
    new Prisma.Decimal(0),
  );
  const totalIncome = incomeAgg._sum.amount ?? new Prisma.Decimal(0);
  const totalExpense = expenseAgg._sum.amount ?? new Prisma.Decimal(0);
  const activeBudget = budgets.find((b) => b.active) ?? null;

  return {
    user: { name: user.name, email: user.email, currency: user.currency },
    account,
    range,
    summary: {
      currentBalance: account.currentBalance,
      netWorth,
      totalLoanDebt,
      totalBudgetPlanned: activeBudget?.startAmount ?? new Prisma.Decimal(0),
      totalBudgetRemaining: activeBudget?.remainingAmount ?? new Prisma.Decimal(0),
      investmentPortfolioValue,
      totalIncome,
      totalExpense,
      activeGoalCount: goals.length,
    },
    transactions,
    investments: investments.map((inv) => ({
      ...inv,
      gainLoss: inv.currentValue.minus(inv.amount),
      gainLossPercent: inv.amount.isZero()
        ? new Prisma.Decimal(0)
        : inv.currentValue.minus(inv.amount).div(inv.amount).times(100),
    })),
    loans: loans.map((loan, index) => ({ ...loan, label: loanLabel(loan, index) })),
    budgets: budgets.map(buildBudgetPayload),
    goals: goals.map(buildGoalPayload),
  };
}

export type ReportData = Awaited<ReturnType<typeof getReportData>>;

export function loanLabel(loan: { startDate: Date }, index: number): string {
  const started = loan.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Loan ${index + 1} (started ${started})`;
}

export function formatPeriodLabel(range: ReportRange): string {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (!range.startDate && !range.endDate) return 'All time';
  if (range.startDate && range.endDate) return `${fmt(range.startDate)} – ${fmt(range.endDate)}`;
  if (range.startDate) return `From ${fmt(range.startDate)}`;
  return `Until ${fmt(range.endDate as Date)}`;
}
