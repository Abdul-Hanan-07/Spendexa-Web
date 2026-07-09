import { ChevronDown, Landmark, Trash2 } from 'lucide-react';
import type { Loan, LoanRepayment } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { LOAN_STATUS_BADGE_CLASSES, LOAN_STATUS_LABELS, computeTotalToRepay, loanHasRepayments } from './loanUtils';

export type RepaymentsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; repayments: LoanRepayment[] }
  | { status: 'error'; message: string };

export function LoanCard({
  loan,
  currency,
  expanded,
  repaymentsState,
  onToggleExpand,
  onRepay,
  onDelete,
}: {
  loan: Loan;
  currency: string;
  expanded: boolean;
  repaymentsState: RepaymentsState;
  onToggleExpand: () => void;
  onRepay: () => void;
  onDelete: () => void;
}) {
  const principal = Number(loan.principal);
  const rate = Number(loan.interestRate);
  const totalToRepay = computeTotalToRepay(principal, rate);
  const disableDelete = loanHasRepayments(loan);

  return (
    <div className="card card-lift overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="w-full flex flex-wrap items-center justify-between gap-4 p-5 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown
            size={16}
            className={`text-slate-500 dark:text-zinc-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
            <Landmark size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {formatCurrency(loan.principal, currency)} principal
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${LOAN_STATUS_BADGE_CLASSES[loan.status]}`}
              >
                {LOAN_STATUS_LABELS[loan.status]}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
              {rate}% interest · {formatDate(loan.startDate)} – {formatDate(loan.endDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 dark:text-zinc-500">Total to repay</p>
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">{formatCurrency(totalToRepay, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-zinc-500">Remaining</p>
            <p className="text-base font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(loan.remainingAmount, currency)}</p>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {loan.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={onRepay}
                className="inline-flex items-center justify-center min-h-11 text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 rounded-lg transition-colors"
              >
                Repay
              </button>
            )}
            <button
              type="button"
              onClick={disableDelete ? undefined : onDelete}
              disabled={disableDelete}
              aria-label={`Delete loan: ${formatCurrency(loan.principal, currency)} principal`}
              title={disableDelete ? 'Loans with repayments recorded can\'t be deleted' : undefined}
              className="w-11 h-11 shrink-0 flex items-center justify-center text-slate-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 disabled:hover:text-slate-400 dark:disabled:hover:text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-zinc-800 px-5 py-4 bg-slate-50 dark:bg-zinc-950/40">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-3">Repayment history</h4>
          {repaymentsState.status === 'loading' && (
            <p className="text-xs text-slate-500 dark:text-zinc-500">Loading repayment history...</p>
          )}
          {repaymentsState.status === 'error' && (
            <p className="text-xs text-red-600 dark:text-red-400">{repaymentsState.message}</p>
          )}
          {repaymentsState.status === 'loaded' && repaymentsState.repayments.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-zinc-500">No repayments recorded yet.</p>
          )}
          {repaymentsState.status === 'loaded' && repaymentsState.repayments.length > 0 && (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {repaymentsState.repayments.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{formatDate(r.date)}</span>
                  <span className="text-sm font-medium text-green-700 dark:text-emerald-400">
                    -{formatCurrency(r.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
