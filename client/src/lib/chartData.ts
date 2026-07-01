import type { Investment, Transaction } from './api';

export interface BalancePoint {
  date: string;
  isoDate: string;
  balance: number;
}

export function buildBalanceTrend(
  transactions: Transaction[],
  currentBalance: number,
  days: number,
): BalancePoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - (days - 1));

  const inWindow = transactions.filter((t) => new Date(t.date) >= windowStart);
  const signedSum = inWindow.reduce(
    (sum, t) => sum + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)),
    0,
  );

  let runningBalance = currentBalance - signedSum;

  const byDay = new Map<string, number>();
  for (const t of inWindow) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    const signed = t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount);
    byDay.set(key, (byDay.get(key) ?? 0) + signed);
  }

  const points: BalancePoint[] = [];
  const cursor = new Date(windowStart);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    runningBalance += byDay.get(key) ?? 0;
    points.push({
      date: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isoDate: key,
      balance: Math.round(runningBalance * 100) / 100,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export function buildExpenseBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'EXPENSE') continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Number(t.amount));
  }
  return Array.from(byCategory.entries())
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

export interface IncomeExpenseSummary {
  label: string;
  income: number;
  expense: number;
}

export function buildIncomeVsExpense(transactions: Transaction[]): IncomeExpenseSummary {
  const now = new Date();
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const income = monthTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  return {
    label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    income: Math.round(income * 100) / 100,
    expense: Math.round(expense * 100) / 100,
  };
}

export interface AllocationSlice {
  type: string;
  value: number;
}

export function buildInvestmentAllocation(investments: Investment[]): AllocationSlice[] {
  const byType = new Map<string, number>();
  for (const inv of investments) {
    const value = Number(inv.currentValue) > 0 ? Number(inv.currentValue) : Number(inv.amount);
    byType.set(inv.type, (byType.get(inv.type) ?? 0) + value);
  }
  return Array.from(byType.entries()).map(([type, value]) => ({
    type,
    value: Math.round(value * 100) / 100,
  }));
}
