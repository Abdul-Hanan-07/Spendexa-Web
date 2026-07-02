import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Budget } from '../lib/api';

export function useBudgets() {
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [history, setHistory] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.getActiveBudget(), api.getBudgetHistory()])
      .then(([active, hist]) => {
        setActiveBudget(active.budget);
        setHistory(hist.budgets);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load budgets');
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return {
    activeBudget,
    history,
    loading,
    error,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
