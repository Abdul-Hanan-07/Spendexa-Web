import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Investment, InvestmentType } from '../lib/api';

export interface InvestmentFilters {
  type?: InvestmentType;
}

export function useInvestments(filters: InvestmentFilters) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listInvestments(filters)
      .then((res) => {
        if (cancelled) return;
        setInvestments(res.investments);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load investments');
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
    investments,
    loading,
    error,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
