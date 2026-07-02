import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Investment, InvestmentType } from '../../lib/api';
import { INVESTMENT_TYPES, INVESTMENT_TYPE_LABELS } from './investmentTypes';

const fieldClass =
  'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50';

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AddInvestmentPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (investment: Investment) => void;
}) {
  const [type, setType] = useState<InvestmentType>('PSX');
  const [assetName, setAssetName] = useState('');
  const [amount, setAmount] = useState('');
  const [units, setUnits] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    if (!assetName.trim()) {
      setError('Enter an asset name.');
      return;
    }
    if (units && Number.isNaN(Number(units))) {
      setError('Units must be a number.');
      return;
    }
    if (currentValue && Number.isNaN(Number(currentValue))) {
      setError('Current value must be a number.');
      return;
    }
    if (!purchaseDate) {
      setError('Pick a purchase date.');
      return;
    }

    setSubmitting(true);
    try {
      const { investment } = await api.createInvestment({
        type,
        assetName: assetName.trim(),
        amount: parsedAmount,
        units: units ? Number(units) : undefined,
        currentValue: currentValue ? Number(currentValue) : undefined,
        purchaseDate: new Date(`${purchaseDate}T00:00:00`).toISOString(),
      });
      onCreated(investment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-100">Add investment</h2>
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
              <label htmlFor="type" className="text-xs font-medium text-zinc-400 mb-2 block">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as InvestmentType)}
                className={fieldClass}
              >
                {INVESTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INVESTMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assetName" className="text-xs font-medium text-zinc-400 mb-2 block">
                Asset name
              </label>
              <input
                id="assetName"
                type="text"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g. Bitcoin, Gold, OGDC"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="amount" className="text-xs font-medium text-zinc-400 mb-2 block">
                Amount invested
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="units" className="text-xs font-medium text-zinc-400 mb-2 block">
                  Units <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  id="units"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.0001"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="currentValue" className="text-xs font-medium text-zinc-400 mb-2 block">
                  Current value <span className="text-zinc-600">(optional)</span>
                </label>
                <input
                  id="currentValue"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0.00"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="purchaseDate" className="text-xs font-medium text-zinc-400 mb-2 block">
                Purchase date
              </label>
              <input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                max={todayInputValue()}
                onChange={(e) => setPurchaseDate(e.target.value)}
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
              {submitting ? 'Adding…' : 'Add investment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
