import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Transaction, TransactionType } from '../lib/api';

const PAGE_SIZE = 20;

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(filters: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listTransactions({ ...filters, limit: PAGE_SIZE, offset: 0 })
      .then((res) => {
        if (cancelled) return;
        setTransactions(res.transactions);
        setHasMore(res.transactions.length === PAGE_SIZE);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
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

  function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    api
      .listTransactions({ ...filters, limit: PAGE_SIZE, offset: transactions.length })
      .then((res) => {
        setTransactions((prev) => [...prev, ...res.transactions]);
        setHasMore(res.transactions.length === PAGE_SIZE);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load more transactions');
      })
      .finally(() => setLoadingMore(false));
  }

  return {
    transactions,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
