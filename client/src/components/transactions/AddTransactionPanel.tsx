import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Transaction, TransactionType } from '../../lib/api';

const CATEGORY_PRESETS = [
  'Food',
  'Rent',
  'Salary',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Education',
  'Shopping',
  'Gift',
  'Travel',
];

const fieldClass =
  'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AddTransactionPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (transaction: Transaction) => void;
}) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryPreset, setCategoryPreset] = useState(CATEGORY_PRESETS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCustomCategory = categoryPreset === 'Other';
  const category = isCustomCategory ? customCategory.trim() : categoryPreset;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (!category) {
      setError('Enter a category.');
      return;
    }
    if (!date) {
      setError('Pick a date.');
      return;
    }

    setSubmitting(true);
    try {
      const { transaction } = await api.createTransaction({
        amount: parsedAmount,
        type,
        category,
        date: new Date(`${date}T00:00:00`).toISOString(),
      });
      onCreated(transaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add transaction</h2>
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
              <label className="text-xs font-medium text-zinc-400 mb-2 block">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`text-sm font-medium py-2.5 rounded-lg border transition-colors ${
                    type === 'EXPENSE'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`text-sm font-medium py-2.5 rounded-lg border transition-colors ${
                    type === 'INCOME'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="amount" className="text-xs font-medium text-zinc-400 mb-2 block">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="category" className="text-xs font-medium text-zinc-400 mb-2 block">
                Category
              </label>
              <select
                id="category"
                value={categoryPreset}
                onChange={(e) => setCategoryPreset(e.target.value)}
                className={fieldClass}
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other…</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter a category"
                  autoFocus
                  className={`${fieldClass} mt-2`}
                />
              )}
            </div>

            <div>
              <label htmlFor="date" className="text-xs font-medium text-zinc-400 mb-2 block">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                max={todayInputValue()}
                onChange={(e) => setDate(e.target.value)}
                className={`${fieldClass} [color-scheme:dark]`}
              />
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
              className="flex-1 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Adding…' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
