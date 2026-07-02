import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Budget } from '../../lib/api';

const fieldClass =
  'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function UpsertBudgetPanel({
  initialBudget,
  onClose,
  onUpserted,
}: {
  initialBudget?: Budget;
  onClose: () => void;
  onUpserted: () => void;
}) {
  const isEditing = !!initialBudget;
  const [name, setName] = useState(initialBudget?.name ?? '');
  const [startAmount, setStartAmount] = useState(initialBudget?.startAmount ?? '');
  const [startDate, setStartDate] = useState(
    initialBudget?.startDate ? initialBudget.startDate.split('T')[0] : todayInputValue(),
  );
  const [endDate, setEndDate] = useState(initialBudget?.endDate ? initialBudget.endDate.split('T')[0] : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Budget name is required.');
      return;
    }

    const parsedAmount = Number(startAmount);
    if (!startAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Pick a start and end date.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Start date must be before end date.');
      return;
    }

    setSubmitting(true);
    try {
      await api.upsertBudget({
        name: name.trim(),
        startAmount: parsedAmount,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T00:00:00`).toISOString(),
      });
      onUpserted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  }

  const title = isEditing ? 'Update budget' : 'Create budget';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label htmlFor="name" className="text-xs font-medium text-zinc-400 mb-2 block">
                Budget name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Monthly budget"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="startAmount" className="text-xs font-medium text-zinc-400 mb-2 block">
                Amount
              </label>
              <input
                id="startAmount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={startAmount}
                onChange={(e) => setStartAmount(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="text-xs font-medium text-zinc-400 mb-2 block">
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-xs font-medium text-zinc-400 mb-2 block">
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 px-6 py-5 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-medium text-zinc-400 hover:text-zinc-100 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-400 disabled:opacity-60 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Saving…' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
