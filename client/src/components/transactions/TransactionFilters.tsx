import type { TransactionType } from '../../lib/api';

export interface TransactionFilterState {
  type: TransactionType | 'ALL';
  category: string;
  search: string;
  startDate: string;
  endDate: string;
}

export const EMPTY_FILTERS: TransactionFilterState = {
  type: 'ALL',
  category: '',
  search: '',
  startDate: '',
  endDate: '',
};

const selectClass =
  'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50';

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
    filters.type !== 'ALL' || filters.category !== '' || filters.search !== '' || filters.startDate !== '' || filters.endDate !== '';

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-grow min-w-[12rem]">
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">Search</label>
          <input
            type="text"
            placeholder="Search categories..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={`w-full ${selectClass}`}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">Type</label>
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
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">Category</label>
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
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">From</label>
          <input
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className={`${selectClass} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">To</label>
          <input
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className={`${selectClass} [color-scheme:light] dark:[color-scheme:dark]`}
          />
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
