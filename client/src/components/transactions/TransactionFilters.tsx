import type { TransactionType } from '../../lib/api';

export interface TransactionFilterState {
  type: TransactionType | 'ALL';
  category: string;
  startDate: string;
  endDate: string;
}

export const EMPTY_FILTERS: TransactionFilterState = {
  type: 'ALL',
  category: '',
  startDate: '',
  endDate: '',
};

const selectClass =
  'bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';

export function TransactionFilters({
  filters,
  categories,
  onChange,
  onClear,
}: {
  filters: TransactionFilterState;
  categories: string[];
  onChange: (next: TransactionFilterState) => void;
  onClear: () => void;
}) {
  const hasActiveFilters =
    filters.type !== 'ALL' || filters.category !== '' || filters.startDate !== '' || filters.endDate !== '';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Type</label>
          <select
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value as TransactionType | 'ALL' })}
            className={selectClass}
          >
            <option value="ALL">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Category</label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className={`${selectClass} min-w-[9rem]`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">From</label>
          <input
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className={`${selectClass} [color-scheme:dark]`}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">To</label>
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className={`${selectClass} [color-scheme:dark]`}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
