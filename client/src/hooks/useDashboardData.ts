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

const SLOW_LOADING_THRESHOLD_MS = 3500;

export function useDashboardData(enabled: boolean = true) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);
    setSlow(false);
    setError(null);

    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlow(true);
    }, SLOW_LOADING_THRESHOLD_MS);

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
        clearTimeout(slowTimer);
        if (cancelled) return;
        setSlow(false);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [reloadKey, enabled]);

  return { data, loading, slow, error, refresh: () => setReloadKey((k) => k + 1) };
}
