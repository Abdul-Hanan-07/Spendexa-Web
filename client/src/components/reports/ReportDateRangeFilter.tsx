export interface ReportDateRangeState {
  startDate: string;
  endDate: string;
}

export const EMPTY_RANGE: ReportDateRangeState = { startDate: '', endDate: '' };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateInputValue(d);
}

function startOfYear(): string {
  const d = new Date();
  return toDateInputValue(new Date(d.getFullYear(), 0, 1));
}

const inputClass =
  'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 [color-scheme:light] dark:[color-scheme:dark]';

const PRESETS: { label: string; range: ReportDateRangeState }[] = [
  { label: 'All time', range: EMPTY_RANGE },
  { label: 'Last 30 days', range: { startDate: daysAgo(30), endDate: toDateInputValue(new Date()) } },
  { label: 'Last 90 days', range: { startDate: daysAgo(90), endDate: toDateInputValue(new Date()) } },
  { label: 'This year', range: { startDate: startOfYear(), endDate: toDateInputValue(new Date()) } },
];

export function ReportDateRangeFilter({
  range,
  onChange,
}: {
  range: ReportDateRangeState;
  onChange: (next: ReportDateRangeState) => void;
}) {
  const isActivePreset = (preset: ReportDateRangeState) =>
    preset.startDate === range.startDate && preset.endDate === range.endDate;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400">Quick range</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.range)}
                className={`inline-flex items-center justify-center text-xs font-medium px-3 min-h-11 rounded-lg transition-colors ${
                  isActivePreset(preset.range)
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-500'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">From</label>
          <input
            type="date"
            value={range.startDate}
            max={range.endDate || undefined}
            onChange={(e) => onChange({ ...range, startDate: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-1.5 block">To</label>
          <input
            type="date"
            value={range.endDate}
            min={range.startDate || undefined}
            onChange={(e) => onChange({ ...range, endDate: e.target.value })}
            className={inputClass}
          />
        </div>

        {(range.startDate || range.endDate) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_RANGE)}
            className="text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 px-3 py-2"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
