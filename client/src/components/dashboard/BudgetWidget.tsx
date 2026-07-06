import { AlertTriangle, Wallet } from 'lucide-react';
import type { ActiveBudgetSummary } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { EmptyState } from './EmptyState';

export function BudgetWidget({
  budget,
  currency,
}: {
  budget: ActiveBudgetSummary | null;
  currency: string;
}) {
  if (!budget) {
    return (
      <div className="card card-lift p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-2">Budget</h3>
        <EmptyState
          icon={Wallet}
          title="No active budget"
          description="Set a budget to track your spending against a limit."
          actionLabel="Create a budget"
          actionTo="/budgets"
        />
      </div>
    );
  }

  const start = Number(budget.startAmount);
  const remaining = Number(budget.remainingAmount);
  const spent = Number(budget.spentAmount);
  const pctSpent = start > 0 ? Math.min(Math.max((spent / start) * 100, 0), 100) : 0;

  return (
    <div className={`card card-lift p-5 transition-all duration-300 ${budget.isNearLimit ? 'ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] dark:shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Budget · {budget.name}</h3>
        {budget.isNearLimit && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-md animate-pulse">
            <AlertTriangle size={14} />
            Near limit!
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(remaining, currency)}</span>
        <span className="text-xs text-slate-500 dark:text-zinc-500">remaining of {formatCurrency(start, currency)}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${budget.isNearLimit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-600 dark:bg-amber-500'}`}
          style={{ width: `${pctSpent}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">{formatCurrency(spent, currency)} spent so far</p>
    </div>
  );
}
