import { useState } from 'react';
import type { FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { Investment } from '../../lib/api';

export function UpdateValueModal({
  investment,
  onClose,
  onUpdated,
}: {
  investment: Investment;
  onClose: () => void;
  onUpdated: (investment: Investment) => void;
}) {
  const [currentValue, setCurrentValue] = useState(investment.currentValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = Number(currentValue);
    if (currentValue === '' || Number.isNaN(parsed) || parsed < 0) {
      setError('Enter a valid value of 0 or more.');
      return;
    }

    setSubmitting(true);
    try {
      const { investment: updated } = await api.updateInvestment(investment.id, { currentValue: parsed });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update value');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
          <RefreshCw size={18} />
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">Update current value</h3>
        <p className="text-xs text-zinc-500 mt-1.5">
          Mark the latest market value for <span className="text-zinc-300">{investment.assetName}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="updateCurrentValue" className="text-xs font-medium text-zinc-400 mb-2 block">
            Current value
          </label>
          <input
            id="updateCurrentValue"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoFocus
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
          />

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
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
