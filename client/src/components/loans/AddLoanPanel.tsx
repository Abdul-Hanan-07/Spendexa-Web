import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Loan } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { computeTotalToRepay } from './loanUtils';

const fieldClass =
  'w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 focus:border-amber-600/50 dark:focus:border-amber-500/50';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AddLoanPanel({
  currency,
  onClose,
  onCreated,
}: {
  currency: string;
  onClose: () => void;
  onCreated: (loan: Loan) => void;
}) {
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState(todayInputValue());
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedPrincipal = Number(principal);
  const parsedRate = Number(interestRate);
  const hasValidPreview =
    principal !== '' && interestRate !== '' && !Number.isNaN(parsedPrincipal) && !Number.isNaN(parsedRate);
  const totalToRepay = hasValidPreview ? computeTotalToRepay(parsedPrincipal, parsedRate) : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!principal || Number.isNaN(parsedPrincipal) || parsedPrincipal <= 0) {
      setError('Enter a valid principal greater than 0.');
      return;
    }
    if (interestRate === '' || Number.isNaN(parsedRate) || parsedRate < 0) {
      setError('Enter a valid interest rate of 0 or more.');
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
      const { loan } = await api.createLoan({
        principal: parsedPrincipal,
        interestRate: parsedRate,
        startDate: new Date(`${startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${endDate}T00:00:00`).toISOString(),
      });
      onCreated(loan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add loan');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Add loan</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label htmlFor="principal" className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2 block">
                Principal
              </label>
              <input
                id="principal"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="interestRate" className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2 block">
                Interest rate (%)
              </label>
              <input
                id="interestRate"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3.5 text-center">
              <p className="text-xs text-slate-500 dark:text-zinc-400">Total to repay</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                {hasValidPreview ? formatCurrency(totalToRepay, currency) : '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">Principal + principal &times; rate / 100</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2 block">
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2 block">
                  End date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 px-6 py-5 border-t border-slate-200 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-sm font-semibold text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 disabled:opacity-60 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Adding…' : 'Add loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
