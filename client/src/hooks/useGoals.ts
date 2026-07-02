import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Goal } from '../lib/api';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .listGoals()
      .then((res) => setGoals(res.goals))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load goals');
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  return {
    goals,
    loading,
    error,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
