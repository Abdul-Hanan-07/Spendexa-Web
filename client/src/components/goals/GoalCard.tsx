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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100">{goal.name}</h3>
          <p className="text-xs text-zinc-500 mt-1">{formatTimeRemaining(goal.deadline)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onUpdateProgress}
            className="text-xs font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <TrendingUp size={13} />
            Update
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {formatCurrency(current, currency)} of {formatCurrency(target, currency)}
          </p>
          <p className={`text-xs font-medium ${goal.progress >= 1 ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {progress}%
          </p>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.min(goal.progress * 100, 100)}%`,
              background: 'linear-gradient(to right, #14B8A6, #22C55E)',
            }}
          />
        </div>
      </div>

      <p className="text-xs text-zinc-500 mt-3">Due: {formatDate(goal.deadline)}</p>
    </div>
  );
}
