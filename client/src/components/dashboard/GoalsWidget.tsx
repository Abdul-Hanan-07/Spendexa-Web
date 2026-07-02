import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import type { Goal } from '../../lib/api';
import { formatCurrency, formatShortDate } from '../../lib/format';
import { EmptyState } from './EmptyState';

export function GoalsWidget({ goals, currency }: { goals: Goal[]; currency: string }) {
  const sorted = [...goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Goals</h3>
        <Link to="/goals" className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400">
          View all
        </Link>
      </div>
      {sorted.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a savings goal to start tracking your progress."
          actionLabel="Add your first goal"
          actionTo="/goals"
        />
      ) : (
        <div className="space-y-4">
          {sorted.slice(0, 4).map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-800 dark:text-zinc-200 truncate pr-2">{goal.name}</span>
                <span className="text-xs text-slate-500 dark:text-zinc-500 shrink-0">{formatShortDate(goal.deadline)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(goal.progress, 100)}%`,
                    background: 'linear-gradient(to right, #14B8A6, #22C55E)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500 dark:text-zinc-500">
                  {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">{Math.round(goal.progress)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
