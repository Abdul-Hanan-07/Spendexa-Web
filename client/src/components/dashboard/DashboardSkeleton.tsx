const pulse = 'animate-pulse bg-slate-200 dark:bg-zinc-800 rounded-lg';

function SummaryCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`h-3 w-24 ${pulse}`} />
        <div className={`h-9 w-9 rounded-xl ${pulse}`} />
      </div>
      <div className={`h-7 w-32 ${pulse}`} />
    </div>
  );
}

function ChartCardSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className={`h-4 w-36 ${pulse}`} />
        <div className={`h-3 w-16 ${pulse}`} />
      </div>
      <div className={`${height} w-full ${pulse}`} />
    </div>
  );
}

function ListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className={`h-4 w-32 ${pulse}`} />
        <div className={`h-3 w-14 ${pulse}`} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${pulse}`} />
              <div className="space-y-1.5">
                <div className={`h-3.5 w-28 ${pulse}`} />
                <div className={`h-2.5 w-16 ${pulse}`} />
              </div>
            </div>
            <div className={`h-3.5 w-16 ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Mirrors DashboardPage's real layout (summary cards / balance trend /
// breakdown charts / budget+goals / recent transactions) so the page doesn't
// jump around once real data replaces these placeholders.
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>

      <ChartCardSkeleton height="h-72" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ListCardSkeleton rows={2} />
        <ListCardSkeleton rows={3} />
      </div>

      <ListCardSkeleton rows={5} />
    </div>
  );
}
