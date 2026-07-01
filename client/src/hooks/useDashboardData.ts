import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { DashboardSummary, Goal, Investment, Loan, Transaction } from '../lib/api';

interface DashboardData {
  summary: DashboardSummary;
  transactions: Transaction[];
  recentTransactions: Transaction[];
  investments: Investment[];
  loans: Loan[];
  goals: Goal[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    Promise.all([
      api.getDashboard(),
      api.listTransactions({ startDate: ninetyDaysAgo.toISOString(), limit: 100 }),
      api.listTransactions({ limit: 10 }),
      api.listInvestments(),
      api.listLoans(),
      api.listGoals(),
    ])
      .then(([summary, txWindow, recentTx, investmentsRes, loansRes, goalsRes]) => {
        if (cancelled) return;
        setData({
          summary,
          transactions: txWindow.transactions,
          recentTransactions: recentTx.transactions,
          investments: investmentsRes.investments,
          loans: loansRes.loans,
          goals: goalsRes.goals,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { data, loading, error, refresh: () => setReloadKey((k) => k + 1) };
}
