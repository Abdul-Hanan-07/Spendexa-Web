import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { DashboardSummary, Goal, Investment, Loan, Transaction } from '../lib/api';
import { consumePrefetchedDashboard } from '../lib/dashboardPrefetch';

interface DashboardData {
  summary: DashboardSummary;
  transactions: Transaction[];
  recentTransactions: Pick<Transaction, 'id' | 'amount' | 'type' | 'category' | 'date'>[];
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

    // A single call: /api/dashboard already bundles the 90-day transaction
    // window, recent transactions, investments, loans, and goals server-side
    // (one Promise.all, same DB load) instead of the frontend making 6
    // separate round trips for data that's all needed on first paint anyway.
    // If login/register already kicked this off (see dashboardPrefetch.ts),
    // reuse that in-flight request instead of firing a second one.
    (consumePrefetchedDashboard() ?? api.getDashboard())
      .then((summary) => {
        if (cancelled) return;
        setData({
          summary,
          transactions: summary.transactions,
          recentTransactions: summary.recentTransactions,
          investments: summary.investments,
          loans: summary.loans,
          goals: summary.goals,
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
