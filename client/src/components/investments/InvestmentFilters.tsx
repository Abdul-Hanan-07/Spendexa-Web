import type { InvestmentType } from '../../lib/api';
import { INVESTMENT_TYPES, INVESTMENT_TYPE_LABELS } from './investmentTypes';

export interface InvestmentFilterState {
  type: InvestmentType | 'ALL';
}

export const EMPTY_INVESTMENT_FILTERS: InvestmentFilterState = { type: 'ALL' };

const selectClass =
  'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50';

export function InvestmentFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: InvestmentFilterState;
  onChange: (next: InvestmentFilterState) => void;
  onClear: () => void;
}) {
  const hasActiveFilters = filters.type !== 'ALL';

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">Type</label>
          <select
            value={filters.type}
            onChange={(e) => onChange({ type: e.target.value as InvestmentType | 'ALL' })}
            className={selectClass}
          >
            <option value="ALL">All</option>
            {INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {INVESTMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
