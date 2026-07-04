import { useState } from 'react';
import type { FormEvent } from 'react';
import { HandCoins } from 'lucide-react';
import { api } from '../../lib/api';
import type { Loan, LoanRepayment } from '../../lib/api';
import { formatCurrency } from '../../lib/format';

export function RepayLoanModal({
  loan,
  currency,
  onClose,
  onRepaid,
}: {
  loan: Loan;
  currency: string;
  onClose: () => void;
  onRepaid: (loan: Loan, repayment: LoanRepayment) => void;
}) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Number(loan.remainingAmount);
  const parsedAmount = Number(amount);
  const hasValidAmount = amount !== '' && !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const remainingAfter = hasValidAmount ? Math.max(remaining - parsedAmount, 0) : remaining;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasValidAmount) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const { loan: updatedLoan, repayment } = await api.repayLoan(loan.id, { amount: parsedAmount });
      onRepaid(updatedLoan, repayment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record repayment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm card p-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-500 mb-4">
          <HandCoins size={18} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Record a repayment</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1.5">
          Against the {formatCurrency(loan.principal, currency)} principal loan.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="repayAmount" className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2 block">
            Amount
          </label>
          <input
            id="repayAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 focus:border-amber-600/50 dark:focus:border-amber-500/50"
          />

          <div className="flex items-center justify-between mt-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3.5 py-3">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">Remaining before</p>
              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{formatCurrency(remaining, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">Remaining after</p>
              <p className={`text-sm font-semibold ${remainingAfter === 0 ? 'text-green-700 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                {formatCurrency(remainingAfter, currency)}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 px-3.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm font-medium text-white bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400 disabled:opacity-60 px-3.5 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Recording…' : 'Repay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
