import { Trash2 } from 'lucide-react';
import type { Budget } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { getBudgetProgressColor } from './budgetUtils';

export function BudgetCard({
  budget,
  currency,
  expanded,
  onToggleExpand,
  onEdit,
  onDeactivate,
}: {
  budget: Budget;
  currency: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const spent = Number(budget.spentAmount);
  const total = Number(budget.startAmount);
  const progress = total > 0 ? (spent / total) * 100 : 0;

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
        className="w-full flex flex-col gap-4 p-5 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{budget.name}</h3>
              {budget.isNearLimit && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-500">
                  Near limit
                </span>
              )}
            </div>
            {budget.startDate && budget.endDate && (
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500 dark:text-zinc-500">Remaining</p>
            <p className="text-base font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(budget.remainingAmount, currency)}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {formatCurrency(budget.spentAmount, currency)} of {formatCurrency(budget.startAmount, currency)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{progress.toFixed(0)}%</p>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBudgetProgressColor(budget.isNearLimit)} transition-all`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-zinc-800 px-5 py-4 bg-slate-50 dark:bg-zinc-950/40 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onDeactivate}
            className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-zinc-800/60 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}
