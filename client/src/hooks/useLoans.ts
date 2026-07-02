import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Loan, LoanStatus } from '../lib/api';

export interface LoansFilters {
  status?: LoanStatus;
}

export function useLoans(filters: LoansFilters) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listLoans(filters)
      .then((res) => {
        if (cancelled) return;
        setLoans(res.loans);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load loans');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, reloadKey]);

  return {
    loans,
    loading,
    error,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
