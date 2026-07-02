import { useState } from 'react';
import type { FormEvent } from 'react';
import { TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import type { Goal } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

export function UpdateGoalProgressModal({
  goal,
  currency,
  onClose,
  onUpdated,
}: {
  goal: Goal;
  currency: string;
  onClose: () => void;
  onUpdated: (goal: Goal) => void;
}) {
  const [currentAmount, setCurrentAmount] = useState(goal.currentAmount);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(currentAmount);
  const target = Number(goal.targetAmount);
  const newProgress = target > 0 ? (parsedAmount / target) * 100 : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedCurrent = Number(currentAmount);
    if (Number.isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Current amount must be 0 or more.');
      return;
    }

    setSubmitting(true);
    try {
      const { goal: updated } = await api.updateGoal(goal.id, { currentAmount: parsedCurrent });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
          <TrendingUp size={18} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Update progress</h3>
        <p className="text-xs text-zinc-500 mt-1.5">For "{goal.name}"</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="currentAmount" className="text-xs font-medium text-zinc-400 mb-2 block">
            Current amount
          </label>
          <input
            id="currentAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoFocus
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
          />

          <div className="flex items-center justify-between mt-4 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-3">
            <div>
              <p className="text-[11px] text-zinc-500">Target</p>
              <p className="text-sm font-medium text-zinc-300">{formatCurrency(goal.targetAmount, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-zinc-500">Progress</p>
              <p className={`text-sm font-semibold ${newProgress >= 100 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {newProgress.toFixed(1)}%
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 px-3.5 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 disabled:opacity-60 px-3.5 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
