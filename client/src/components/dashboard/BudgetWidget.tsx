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
    <div className="card card-lift p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Budget · {budget.name}</h3>
        {budget.isNearLimit && (
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md">
            <AlertTriangle size={12} />
            Near limit
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xl font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(remaining, currency)}</span>
        <span className="text-xs text-slate-500 dark:text-zinc-500">remaining of {formatCurrency(start, currency)}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${budget.isNearLimit ? 'bg-yellow-600 dark:bg-yellow-500' : 'bg-amber-600 dark:bg-amber-500'}`}
          style={{ width: `${pctSpent}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">{formatCurrency(spent, currency)} spent so far</p>
    </div>
  );
}
