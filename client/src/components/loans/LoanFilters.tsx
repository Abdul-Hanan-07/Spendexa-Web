import type { LoanStatus } from '../../lib/api';

export interface LoanFilterState {
  status: LoanStatus | 'ALL';
}

export const EMPTY_LOAN_FILTERS: LoanFilterState = { status: 'ALL' };

const selectClass =
  'bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50';

export function LoanFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: LoanFilterState;
  onChange: (next: LoanFilterState) => void;
  onClear: () => void;
}) {
  const hasActiveFilters = filters.status !== 'ALL';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as LoanStatus | 'ALL' })}
            className={selectClass}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="PAID_OFF">Paid Off</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-amber-500 hover:text-amber-400 px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
