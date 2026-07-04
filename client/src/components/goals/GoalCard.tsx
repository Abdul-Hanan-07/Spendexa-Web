import { Pencil, Trash2, TrendingUp } from 'lucide-react';
import type { Goal } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/format';
import { formatTimeRemaining } from './goalUtils';

export function GoalCard({
  goal,
  currency,
  onUpdateProgress,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  currency: string;
  onUpdateProgress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const progress = (goal.progress * 100).toFixed(1);

  return (
    <div className="card card-lift p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{goal.name}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{formatTimeRemaining(goal.deadline)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onUpdateProgress}
            className="text-xs font-semibold text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <TrendingUp size={13} />
            Update
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {formatCurrency(current, currency)} of {formatCurrency(target, currency)}
          </p>
          <p className={`text-xs font-medium ${goal.progress >= 1 ? 'text-green-700 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400'}`}>
            {progress}%
          </p>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.min(goal.progress * 100, 100)}%`,
              background: 'linear-gradient(to right, #14B8A6, #22C55E)',
            }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-3">Due: {formatDate(goal.deadline)}</p>
    </div>
  );
}
